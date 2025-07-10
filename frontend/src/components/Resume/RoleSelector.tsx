import React from 'react';

export interface TechRole {
  id: string;
  title: string;
  description: string;
}

export const techRoles: TechRole[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Specializes in user interfaces, client-side development, and responsive web design',
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Focuses on server-side logic, APIs, and database management',
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    description: 'Handles both client and server-side development with end-to-end expertise',
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    description: 'Manages deployment, infrastructure, and continuous integration/delivery',
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    description: 'Creates native and cross-platform mobile applications',
  },
  {
    id: 'cloud',
    title: 'Cloud Engineer',
    description: 'Designs and maintains cloud infrastructure and services',
  },
  {
    id: 'ai',
    title: 'AI/ML Engineer',
    description: 'Develops machine learning models and artificial intelligence solutions',
  },
  {
    id: 'data',
    title: 'Data Engineer',
    description: 'Builds data pipelines and manages data infrastructure',
  },
  {
    id: 'security',
    title: 'Security Engineer',
    description: 'Implements security measures and protects against cyber threats',
  },
  {
    id: 'qa',
    title: 'QA Engineer',
    description: 'Ensures software quality through testing and automation',
  },
  {
    id: 'blockchain',
    title: 'Blockchain Developer',
    description: 'Develops decentralized applications and smart contracts',
  },
  {
    id: 'embedded',
    title: 'Embedded Systems Engineer',
    description: 'Programs software for embedded systems and IoT devices',
  },
  {
    id: 'gamedev',
    title: 'Game Developer',
    description: 'Creates video games and interactive entertainment software',
  },
  {
    id: 'ar_vr',
    title: 'AR/VR Developer',
    description: 'Develops augmented and virtual reality experiences',
  },
  {
    id: 'sre',
    title: 'Site Reliability Engineer',
    description: 'Maintains system reliability, scalability, and performance',
  }
];

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (roleId: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {techRoles.map((role) => (
        <button
          key={role.id}
          onClick={() => onRoleChange(role.id)}
          className={`p-4 rounded-lg border transition-all text-left ${
            selectedRole === role.id
              ? 'border-secondary bg-card-hover text-secondary'
              : 'border-default text-muted hover:bg-card-hover hover:text-default'
          }`}
        >
          <h3 className="font-medium mb-1">{role.title}</h3>
          <p className="text-sm text-muted line-clamp-2">{role.description}</p>
        </button>
      ))}
    </div>
  );
};

export default RoleSelector; 