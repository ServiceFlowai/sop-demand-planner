import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Chip, Stack, TextField, Avatar, Paper } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  text: string;
}

enum WorkflowStatus {
  DRAFT = 'draft',
  DEMAND_REVIEW = 'demand_review',
  SUPPLY_REVIEW = 'supply_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

interface WorkflowProps {
  workflowId: string;
  initialStatus: WorkflowStatus;
  currentUserId: string;
  currentUserRole: 'demand_planner' | 'supply_planner' | 'approver';
  onStatusChange: (newStatus: WorkflowStatus, comments?: string) => Promise<void>;
  onCommentSubmit: (comment: string) => Promise<void>;
  comments: Comment[];
}

const statusColors: Record<WorkflowStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [WorkflowStatus.DRAFT]: 'default',
  [WorkflowStatus.DEMAND_REVIEW]: 'info',
  [WorkflowStatus.SUPPLY_REVIEW]: 'warning',
  [WorkflowStatus.APPROVED]: 'success',
  [WorkflowStatus.REJECTED]: 'error',
};

const statusLabels: Record<WorkflowStatus, string> = {
  [WorkflowStatus.DRAFT]: 'Draft',
  [WorkflowStatus.DEMAND_REVIEW]: 'Demand Review',
  [WorkflowStatus.SUPPLY_REVIEW]: 'Supply Review',
  [WorkflowStatus.APPROVED]: 'Approved',
  [WorkflowStatus.REJECTED]: 'Rejected',
};

const PlanningWorkflow: React.FC<WorkflowProps> = ({
  workflowId,
  initialStatus,
  currentUserId,
  currentUserRole,
  onStatusChange,
  onCommentSubmit,
  comments: initialComments,
}) => {
  const [status, setStatus] = useState<WorkflowStatus>(initialStatus);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleStatusUpdate = useCallback(async (newStatus: WorkflowStatus) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const approvalComment = `Workflow status changed to '${statusLabels[newStatus]}'.`;
      await onStatusChange(newStatus, approvalComment);
      setStatus(newStatus);
      if (approvalComment) {
        setComments(prev => [
          ...prev,
          {
            id: `auto-${Date.now()}`,
            userId: currentUserId,
            userName: 'System',
            timestamp: new Date().toISOString(),
            text: approvalComment,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to update workflow status:', error);
      // Optionally, revert UI status or show error message
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onStatusChange, currentUserId]);

  const handleCommentSubmit = useCallback(async () => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCommentSubmit(commentText);
      // Assuming onCommentSubmit triggers a re-fetch of comments or adds locally before backend confirmation
      // For this example, we'll optimistically add it locally.
      setComments(prev => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          userId: currentUserId,
          userName: 'You',
          timestamp: new Date().toISOString(),
          text: commentText,
        },
      ]);
      setCommentText('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [commentText, isSubmitting, onCommentSubmit, currentUserId]);

  const canReject = ([WorkflowStatus.DEMAND_REVIEW, WorkflowStatus.SUPPLY_REVIEW, WorkflowStatus.APPROVED].includes(status));

  const renderActionButtons = () => {
    switch (status) {
      case WorkflowStatus.DRAFT:
        if (currentUserRole === 'demand_planner') {
          return (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={() => handleStatusUpdate(WorkflowStatus.DEMAND_REVIEW)}
              disabled={isSubmitting}
            >
              Submit for Demand Review
            </Button>
          );
        }
        break;
      case WorkflowStatus.DEMAND_REVIEW:
        if (currentUserRole === 'demand_planner') {
          return (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={() => handleStatusUpdate(WorkflowStatus.SUPPLY_REVIEW)}
                disabled={isSubmitting}
              >
                Approve Demand
              </Button>
              {canReject && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={() => handleStatusUpdate(WorkflowStatus.REJECTED)}
                  disabled={isSubmitting}
                >
                  Reject
                </Button>
              )}
            </Stack>
          );
        }
        break;
      case WorkflowStatus.SUPPLY_REVIEW:
        if (currentUserRole === 'supply_planner') {
          return (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={() => handleStatusUpdate(WorkflowStatus.APPROVED)}
                disabled={isSubmitting}
              >
                Approve Supply
              </Button>
              {canReject && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={() => handleStatusUpdate(WorkflowStatus.REJECTED)}
                  disabled={isSubmitting}
                >
                  Reject
                </Button>
              )}
            </Stack>
          );
        }
        break;
      case WorkflowStatus.APPROVED:
        // No further primary actions, could allow 'reopen' if needed
        break;
      case WorkflowStatus.REJECTED:
        // Could allow 'restart' if needed
        break;
      default:
        return null;
    }
    return null;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Consensus Planning Workflow</Typography>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="subtitle1">Current Status:</Typography>
        <Chip label={statusLabels[status]} color={statusColors[status]} />
        {status === WorkflowStatus.REJECTED && (
          <Typography variant="body2" color="error">This workflow has been rejected.</Typography>
        )}
      </Stack>

      <Box mb={3}>
        {renderActionButtons()}
      </Box>

      <Typography variant="h6" gutterBottom>Comments</Typography>
      <Stack spacing={2} sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', p: 2, borderRadius: 1, mb: 2 }}>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
        ) : (
          comments.map((comment) => (
            <Box key={comment.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 24, height: 24, fontSize: '0.8rem' }}>
                {comment.userName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {comment.userName}
                  <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                    {new Date(comment.timestamp).toLocaleString()}
                  </Typography>
                </Typography>
                <Typography variant="body2">{comment.text}</Typography>
              </Box>
            </Box>
          ))
        )}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          variant="outlined"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCommentSubmit();
            }
          }}
          disabled={isSubmitting}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleCommentSubmit}
          disabled={!commentText.trim() || isSubmitting}
        >
          Send
        </Button>
      </Stack>
    </Paper>
  );
};

export default PlanningWorkflow;
export { WorkflowStatus };
export type { Comment, WorkflowProps };
