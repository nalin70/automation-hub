const JOB_DOMAINS = [
  { id: 'node', label: 'Node.js', query: 'Node.js Developer', keywords: ['node', 'node.js', 'javascript'] },
  { id: 'frontend', label: 'Frontend', query: 'Frontend Developer', keywords: ['frontend', 'react', 'javascript'] },
  { id: 'backend', label: 'Backend', query: 'Backend Developer', keywords: ['backend', 'api', 'node', 'java', 'python'] },
  { id: 'fullstack', label: 'Full stack', query: 'Full Stack Developer', keywords: ['full stack', 'fullstack', 'node', 'react'] },
  { id: 'react', label: 'React', query: 'React Developer', keywords: ['react', 'frontend'] },
  { id: 'python', label: 'Python', query: 'Python Developer', keywords: ['python', 'django', 'flask'] },
];

const JOB_CITIES = [
  { id: 'remote', label: 'Remote', location: 'Remote' },
  { id: 'bangalore', label: 'Bengaluru', location: 'Bengaluru, Karnataka, India' },
  { id: 'hyderabad', label: 'Hyderabad', location: 'Hyderabad, Telangana, India' },
  { id: 'pune', label: 'Pune', location: 'Pune, Maharashtra, India' },
  { id: 'chennai', label: 'Chennai', location: 'Chennai, Tamil Nadu, India' },
  { id: 'mumbai', label: 'Mumbai', location: 'Mumbai, Maharashtra, India' },
  { id: 'delhi', label: 'Delhi NCR', location: 'Delhi NCR, India' },
];

const JOB_EXPERIENCE_LEVELS = [
  { id: 'fresher', label: 'Fresher', query: 'fresher entry level' },
  { id: 'junior', label: '1-3 years', query: '1-3 years experience' },
  { id: 'mid', label: '3-5 years', query: '3-5 years experience' },
  { id: 'senior', label: '5+ years', query: 'senior 5+ years experience' },
];

module.exports = {
  JOB_CITIES,
  JOB_DOMAINS,
  JOB_EXPERIENCE_LEVELS,
};
