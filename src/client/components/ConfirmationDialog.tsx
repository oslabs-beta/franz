import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { validate } from "../utils/validate";
import { DialogProps } from "../../../types/types";
import { useMutation } from "@apollo/client";

export default function ConfirmationDialog({
  title,
  content,
  label,
  actions,
  control,
  args,
  variant,
  color,
  cta,
  disabled,
  update,
}: DialogProps) {
  const [value, setValue] = useState("");
  const [formError, setFormError] = useState(false);
  const [open, setOpen] = useState(false);
  const [mutation, { loading, error }] = useMutation(actions);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (validate(value, control)) {
      mutation({
        variables: {
          ...args,
        },
        onCompleted: () => {
          update();
        },
      });
      if (!loading && !error) {
        setValue("");
        setFormError(false);
        handleClose();
      }
    } else {
      setFormError(true);
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        color={color}
        disabled={disabled}
        onClick={handleOpen}
      >
        {cta}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
          <TextField
            error={formError}
            autoFocus
            margin="dense"
            id={label.replace("", "_")}
            label={label}
            fullWidth
            variant="standard"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant={variant} color={color}>
            {cta}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
