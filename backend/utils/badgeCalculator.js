// avgDays is in days (converted from ms)
const getBadge = (totalResolved, avgDays) => {
  if (!totalResolved || totalResolved === 0) {
    return {
      label: 'Inactive',
      color: 'bg-gray-500/20 text-gray-400',
      icon:  'Clock'
    };
  }
  // avgDays < 0.125 = less than 3 hours
  if (avgDays !== null && avgDays <= 0.125) {
    return {
      label: 'Fast Responder',
      color: 'bg-green-500/20 text-green-400',
      icon:  'Zap'
    };
  }
  if (totalResolved > 10) {
    return {
      label: 'Quality Champion',
      color: 'bg-yellow-500/20 text-yellow-400',
      icon:  'Award'
    };
  }
  if (totalResolved >= 5) {
    return {
      label: 'Issue Resolver',
      color: 'bg-blue-500/20 text-blue-400',
      icon:  'CheckCircle'
    };
  }
  if (avgDays !== null && avgDays > 5) {
    return {
      label: 'Slow Performer',
      color: 'bg-red-500/20 text-red-400',
      icon:  'Clock'
    };
  }
  return {
    label: 'Active',
    color: 'bg-purple-500/20 text-purple-400',
    icon:  'Star'
  };
};

module.exports = { getBadge };