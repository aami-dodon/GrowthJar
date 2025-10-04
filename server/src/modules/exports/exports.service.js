import PDFDocument from 'pdfkit';
import { prisma } from '../../config/prisma.js';
import { createHttpError } from '../../utils/errors.js';
import { childProfile } from '../../shared/constants/childProfile.js';

const periodToRange = (period) => {
  switch (period) {
    case 'weekly':
      return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0);
  }
};

const ensureFamilyMember = async ({ userId, familyId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw createHttpError(403, 'Access denied');
  }
  return user;
};

const fetchEntriesForExport = ({ familyId, period }) =>
  prisma.jarEntry.findMany({
    where: {
      familyId,
      createdAt: { gte: periodToRange(period) },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: { firstName: true, lastName: true, role: true },
      },
    },
  });

const createCsv = (entries) => {
  const headers = ['Date', 'Type', 'Author', 'Content'];
  const rows = entries.map((entry) => [
    entry.createdAt.toISOString(),
    entry.entryType,
    `${entry.user.firstName ?? ''} ${entry.user.lastName ?? ''}`.trim(),
    JSON.stringify({ content: entry.content, metadata: entry.metadata }),
  ]);
  const allRows = [headers, ...rows];
  return allRows.map((row) => row.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(',')).join('\n');
};

const createPdf = (entries) =>
  new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text(`${childProfile.jarName} Export`, { underline: true });
    doc.moveDown();

    entries.forEach((entry) => {
      doc.fontSize(12).text(`Date: ${entry.createdAt.toISOString()}`);
      doc.text(`Type: ${entry.entryType}`);
      doc.text(`Author: ${entry.user.firstName ?? ''} ${entry.user.lastName ?? ''}`.trim());
      doc.text(`Content: ${entry.content}`);
      if (entry.metadata) {
        doc.text(`Metadata: ${JSON.stringify(entry.metadata)}`);
      }
      doc.moveDown();
    });

    doc.end();
  });

export const exportCsv = async ({ userId, familyId, period }) => {
  await ensureFamilyMember({ userId, familyId });
  const entries = await fetchEntriesForExport({ familyId, period });
  const csv = createCsv(entries);
  return Buffer.from(csv, 'utf-8');
};

export const exportPdf = async ({ userId, familyId, period }) => {
  await ensureFamilyMember({ userId, familyId });
  const entries = await fetchEntriesForExport({ familyId, period });
  return createPdf(entries);
};
