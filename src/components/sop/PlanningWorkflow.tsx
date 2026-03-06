import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Chip,
  TextField,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  avatarUrl?: string;
}

interface PlanStep {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  approver?: string;
  approvalDate?: string;
}

type WorkflowStatus = 'draft' | 'demand_review' | 'supply_review' | 'approved' | 'rejected';

const STATUS_MAP: Record<WorkflowStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }>= {
  draft: { label: 'Draft', color: 'default' },
  demand_review: { label: 'Demand Review', color: 'info' },
  supply_review: { label: 'Supply Review', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
};

const STEPS_CONFIG: PlanStep[] = [
  { id: 'drafting', name: 'Drafting', status: 'approved' }, // Assuming initial draft is 'approved' by creator
  { id: 'demand_review', name: 'Demand Review', status: 'pending' },
  { id: 'supply_review', name: 'Supply Review', status: 'pending' },
  { id: 'final_approval', name: 'Final Approval', status: 'pending' },
];

/**
 * Renders a multi-step consensus planning workflow component.
 * Features status badges, approval/reject buttons, and a comment thread.
 * @param initialWorkflowStatus The initial status of the workflow.
 * @param initialComments Initial comments for the thread.
 * @param initialSteps Initial configuration for the workflow steps.
 */
const PlanningWorkflow: React.FC = () => {
  const [currentWorkflowStatus, setCurrentWorkflowStatus] = useState<WorkflowStatus>('draft');
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<PlanStep[]>(STEPS_CONFIG);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const currentUser = 'John Doe'; // Mock current user

  useEffect(() => {
    // Simulate fetching initial data or setting up the workflow state
    updateActiveStepAndStatus(steps);
    // Add some initial comments for demonstration
    setComments([
      { id: '1', author: 'Jane Smith', timestamp: '2023-10-26T10:00:00Z', text: 'Initial draft looks good.' },
      { id: '2', author: 'Mark Johnson', timestamp: '2023-10-26T14:30:00Z', text: 'Waiting on supply team feedback.' },
    ]);
  }, [steps]);

  const updateActiveStepAndStatus = useCallback((currentSteps: PlanStep[]) => {
    const allApproved = currentSteps.every(step => step.status === 'approved');
    if (allApproved) {
      setCurrentWorkflowStatus('approved');
      setActiveStep(currentSteps.length);
      return;
    }

    const firstPendingIndex = currentSteps.findIndex(step => step.status === 'pending');
    if (firstPendingIndex !== -1) {
      setActiveStep(firstPendingIndex);
      setCurrentWorkflowStatus(currentSteps[firstPendingIndex].id as WorkflowStatus);
      if (currentSteps[firstPendingIndex].status === 'pending') {
        // Set the active step to in_progress if it's the current one being reviewed
        setSteps(prevSteps =>
          prevSteps.map((step, index) =>
            index === firstPendingIndex ? { ...step, status: 'in_progress' } : step
          )
        );
      }
    } else {
      // This case should ideally not be reached if not all are approved
      setCurrentWorkflowStatus('draft'); // Fallback
      setActiveStep(0);
    }
  }, []);

  const handleApproval = (stepIndex: number) => {
    const updatedSteps = steps.map((step, index) => {
      if (index === stepIndex) {
        return { ...step, status: 'approved', approver: currentUser, approvalDate: new Date().toLocaleString() };
      }
      return step;
    });
    setSteps(updatedSteps);
    setComments(prev => [
      ...prev,
      { id: String(prev.length + 1), author: currentUser, timestamp: new Date().toISOString(), text: `Approved step: ${steps[stepIndex].name}.` },
    ]);
    updateActiveStepAndStatus(updatedSteps);
  };

  const handleReject = (stepIndex: number) => {
    const updatedSteps = steps.map((step, index) => {
      if (index === stepIndex) {
        return { ...step, status: 'rejected', approver: currentUser, approvalDate: new Date().toLocaleString() };
      }
      return step;
    });
    // If a step is rejected, the whole workflow goes back to draft or custom state
    setSteps(updatedSteps);
    setCurrentWorkflowStatus('rejected'); // Set overall workflow to rejected
    setActiveStep(0); // Optionally, reset active step for re-initiation
    setComments(prev => [
      ...prev,
      { id: String(prev.length + 1), author: currentUser, timestamp: new Date().toISOString(), text: `Rejected step: ${steps[stepIndex].name}. Reason: [Add actual reason field].` },
    ]);
  };

  const handleAddComment = () => {
    if (newCommentText.trim()) {
      const newComment: Comment = {
        id: String(comments.length + 1),
        author: currentUser,
        timestamp: new Date().toISOString(),
        text: newCommentText.trim(),
      };
      setComments([...comments, newComment]);
      setNewCommentText('');
    }
  };

  const renderStepIcon = (status: PlanStep['status']) => {
    switch (status) {
      case 'approved':
        return <CheckIcon color="success" />;
      case 'rejected':
        return <ErrorIcon color="error" />;
      case 'pending':
      case 'in_progress':
      default:
        return <AccessTimeIcon color="disabled" />;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>Consensus Planning Workflow</Typography>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Typography variant="h6">Current Status:</Typography>
        <Chip
          label={STATUS_MAP[currentWorkflowStatus]?.label || 'Unknown'}
          color={STATUS_MAP[currentWorkflowStatus]?.color || 'default'}
          sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
        />
      </Stack>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel StepIconComponent={() => renderStepIcon(step.status)}>
              {step.name}
              {step.approver && (
                <Typography variant="caption" display="block">
                  {step.status === 'approved' ? 'Approved' : 'Rejected'} by {step.approver} on {step.approvalDate}
                </Typography>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Actions</Typography>
        {activeStep < steps.length && steps[activeStep].status !== 'approved' && steps[activeStep].status !== 'rejected' && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleApproval(activeStep)}
              disabled={currentWorkflowStatus === 'approved' || currentWorkflowStatus === 'rejected'}
            >
              Approve {steps[activeStep].name}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleReject(activeStep)}
              disabled={currentWorkflowStatus === 'approved' || currentWorkflowStatus === 'rejected'}
            >
              Reject {steps[activeStep].name}
            </Button>
          </Stack>
        )} 
        {currentWorkflowStatus === 'approved' && (
          <Typography color="success.main">This plan has been fully approved!</Typography>
        )}
        {currentWorkflowStatus === 'rejected' && (
          <Typography color="error.main">This plan has been rejected. Please review comments for details.</Typography>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Comments</Typography>
        <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
          {comments.length === 0 ? (
            <Typography color="textSecondary">No comments yet.</Typography>
          ) : (
            <Stack spacing={2} divider={<Divider orientation="horizontal" flexItem />}>
              {comments.map((comment) => (
                <Box key={comment.id} display="flex" alignItems="flex-start" spacing={1}>
                  <Avatar src={comment.avatarUrl || `https://i.pravatar.cc/150?u=${comment.author}`} sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2">
                      {comment.author} <Typography component="span" variant="caption" color="textSecondary">- {new Date(comment.timestamp).toLocaleString()}</Typography>
                    </Typography>
                    <Typography variant="body2">{comment.text}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
          variant="outlined"
          sx={{ mb: 1 }}
        />
        <Button variant="contained" onClick={handleAddComment} disabled={!newCommentText.trim()}>Post Comment</Button>
      </Paper>
    </Box>
  );
};

export default PlanningWorkflow;
