import dayjs from 'dayjs'
import { buildEntry, ENTRY_CATEGORIES } from '../utils/entryUtils'

const now = dayjs()

export const initialEntries = [
  buildEntry({
    category: ENTRY_CATEGORIES.PARENT_GOOD_THING,
    author: 'Mom',
    target: 'Rishi',
    text: 'Rishi helped set the dinner table without being asked.',
    createdAt: now.subtract(2, 'day').hour(18).minute(30),
  }),
  buildEntry({
    category: ENTRY_CATEGORIES.PARENT_GRATITUDE,
    author: 'Dad',
    target: 'Rishi',
    text: 'Thank you for reading to your little cousin with so much patience.',
    createdAt: now.subtract(1, 'day').hour(20).minute(5),
  }),
  buildEntry({
    category: ENTRY_CATEGORIES.CHILD_GRATITUDE_FATHER,
    author: 'Rishi',
    target: 'Dad',
    text: 'I loved the bedtime story you made up for me!',
    createdAt: now.subtract(3, 'day').hour(19).minute(45),
  }),
  buildEntry({
    category: ENTRY_CATEGORIES.CHILD_GRATITUDE_MOTHER,
    author: 'Rishi',
    target: 'Mom',
    text: 'Thank you for making my favorite pasta on Tuesday.',
    createdAt: now.subtract(5, 'day').hour(12).minute(15),
  }),
  buildEntry({
    category: ENTRY_CATEGORIES.BETTER_CHOICE,
    author: 'Dad',
    target: 'Rishi',
    text: 'It would have been better if we put away our art supplies after painting.',
    response: 'Next time, I will tidy up as soon as we finish crafting.',
    createdAt: now.subtract(4, 'day').hour(16).minute(10),
  }),
]
