import  { useState, useEffect } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import RoleSelector, { techRoles } from '../components/Resume/RoleSelector';
import ResumeSelector from '../components/Resume/ResumeSelector';
import LinkedInJobInput from '../components/Resume/LinkedInJobInput';
import TailoredResume from '../components/Resume/TailoredResume';
import Card from '../components/Layout/Card';
import { tailorResume } from '../services/groqService';
import { updatePDFWithTailoredText } from '../services/pdfService';
import { buildApiUrl, buildFileUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ResumeData {
  id: string;
  fileName: string;
  originalName: string;
  path: string;
  uploadDate: string;
  extractedText: string;
  textAnalysis: {
    wordCount: number;
    characterCount: number;
  };
}

const ResumePage = () => {
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [tailoredText, setTailoredText] = useState<string>('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoringError, setTailoringError] = useState<string>('');
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState<string | null>(null);
  const [isUpdatingPdf, setIsUpdatingPdf] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const response = await fetch(buildApiUrl('/resumes'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchResumes();
  }, [token, navigate]);

  const handleResumeSelect = async (resumeId: string) => {
    const selected = resumes.find(resume => resume.id === resumeId);
    setSelectedResume(selected || null);
    setTailoredText('');
    setTailoringError('');
  };

  const handleTailorResume = async () => {
    if (!selectedResume || !selectedRole || !token) {
      setTailoringError('Please select both a resume and a target role');
      return;
    }

    setIsTailoring(true);
    setTailoringError('');
    setModifiedPdfUrl(null);

    try {
      const selectedRoleData = techRoles.find(role => role.id === selectedRole);
      if (!selectedRoleData) {
        throw new Error('Invalid role selected');
      }

      const tailoredContent = await tailorResume(
        selectedResume.extractedText,
        selectedRoleData
      );
      setTailoredText(tailoredContent);
      
      setIsUpdatingPdf(true);
      // Convert null token to undefined for buildFileUrl
      const pdfUrl = buildFileUrl(selectedResume.path, token || undefined);
      const modifiedPdfBlob = await updatePDFWithTailoredText(pdfUrl, tailoredContent);
      const modifiedUrl = URL.createObjectURL(modifiedPdfBlob);
      setModifiedPdfUrl(modifiedUrl);
      setIsUpdatingPdf(false);
    } catch (error) {
      setTailoringError('Failed to tailor resume. Please try again.');
      console.error('Error tailoring resume:', error);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleLinkedInJobScraped = (data: any) => {
    setTailoredText(data.tailoredResume);
    
    if (selectedResume && token) {
      setIsUpdatingPdf(true);
      updatePDFWithTailoredText(
        buildFileUrl(selectedResume.path, token || undefined),
        data.tailoredResume
      )
        .then(modifiedPdfBlob => {
          const modifiedUrl = URL.createObjectURL(modifiedPdfBlob);
          setModifiedPdfUrl(modifiedUrl);
        })
        .catch(error => {
          console.error('Error updating PDF:', error);
          setTailoringError('Failed to update PDF with tailored content');
        })
        .finally(() => {
          setIsUpdatingPdf(false);
        });
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pb-24" data-testid="resume-page" data-fetch-resumes={fetchResumes}>
      <h1 className="text-3xl font-semibold mb-8 text-center text-white">Tailor Your Resume</h1>
      
      <div className="space-y-6">
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Select Resume</h2>
              <ResumeSelector
                resumes={resumes}
                selectedResumeId={selectedResume?.id || null}
                onResumeSelect={handleResumeSelect}
              />
            </div>
          </div>
        </Card>

        {selectedResume && (
          <Card>
            <div className="space-y-6">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-white/5 px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus-visible:ring focus-visible:ring-white/20">
                      <span className="text-xl">Tailor for Role</span>
                      <ChevronUpIcon
                        className={`${
                          open ? 'rotate-180 transform' : ''
                        } h-5 w-5 text-white`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-300">
                      <div className="space-y-4">
                        <RoleSelector
                          selectedRole={selectedRole}
                          onRoleChange={setSelectedRole}
                        />
                        {selectedRole && (
                          <button
                            onClick={handleTailorResume}
                            disabled={isTailoring}
                            className="w-full px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isTailoring ? 'Tailoring...' : 'Tailor Resume'}
                          </button>
                        )}
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Or Tailor for Job Posting</h2>
                <LinkedInJobInput
                  selectedResume={selectedResume}
                  onJobScraped={handleLinkedInJobScraped}
                />
              </div>
            </div>
          </Card>
        )}

        <TailoredResume
          text={tailoredText}
          isLoading={isTailoring || isUpdatingPdf}
          error={tailoringError}
        />

        {modifiedPdfUrl && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Download Tailored PDF</h2>
              <a
                href={modifiedPdfUrl}
                download="tailored-resume.pdf"
                className="inline-block px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                Download PDF
              </a>
            </div>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-xs text-gray-400">
            Disclaimer: Our AI-powered resume tailoring service may not be 100% accurate. Please review all suggestions carefully before using them in your final resume.
          </p>
          <a 
            href="https://www.linkedin.com/in/abdullahkhannn" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-white hover:text-gray-200 underline mt-2 inline-block mx-auto"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResumePage; 