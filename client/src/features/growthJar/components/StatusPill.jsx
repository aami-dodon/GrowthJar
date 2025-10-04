import PropTypes from 'prop-types'

const COLOR_VARIANTS = {
  sky: 'bg-sky-100 text-sky-700',
  sunshine: 'bg-sunshine-100 text-sunshine-700',
  lavender: 'bg-lavender-100 text-lavender-700',
}

const StatusPill = ({ children, icon, variant = 'sky' }) => {
  const colorClasses = COLOR_VARIANTS[variant] ?? COLOR_VARIANTS.sky

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${colorClasses}`}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  )
}

StatusPill.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  variant: PropTypes.oneOf(Object.keys(COLOR_VARIANTS)),
}

StatusPill.defaultProps = {
  icon: undefined,
  variant: 'sky',
}

export default StatusPill
