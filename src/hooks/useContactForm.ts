import { useState, useCallback, useEffect } from "react";
import { Contact } from "@/domain/contacts/contactModel";
import { toast } from "sonner";
import {
  contactSchema,
  transformFormToContact,
  transformContactToForm,
} from "@/store/contactSchema";
import { createContact, updateContact } from "@/app/api/endpoints/contacts";
import { z } from "zod";

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export function useContactForm(initialContact?: Contact | null) {
  const [formState, setFormState] = useState<FormState>(() => ({
    values: initialContact
      ? transformContactToForm(initialContact)
      : {
          "general.firstName": "",
          "general.lastName": "",
          "general.email": "",
          "general.phone": "",
          currency: "EUR",
        },
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
  }));

  // Reset form when initialContact changes
  useEffect(() => {
    setFormState({
      values: initialContact
        ? transformContactToForm(initialContact)
        : {
            "general.firstName": "",
            "general.lastName": "",
            "general.email": "",
            "general.phone": "",
            currency: "EUR",
          },
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialContact]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      touched: { ...prev.touched, [field]: true },
      isDirty: true,
    }));
  }, []);

  const validateField = useCallback((field: string, value: any) => {
    try {
      const contactData = transformFormToContact({ [field]: value });
      contactSchema.parse(contactData);
      return "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(
          (err) => err.path.join(".") === field
        );
        return fieldError ? fieldError.message : "";
      }
      return "Invalid value";
    }
  }, []);

  const handleBlur = useCallback(
    (field: string) => {
      const error = validateField(field, formState.values[field]);
      setFormState((prev) => ({
        ...prev,
        touched: { ...prev.touched, [field]: true },
        errors: { ...prev.errors, [field]: error },
      }));
    },
    [formState.values, validateField]
  );

  const validateForm = useCallback(() => {
    try {
      const contactData = transformFormToContact(formState.values);
      contactSchema.parse(contactData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = Object.fromEntries(
          error.errors.map((err) => [err.path.join("."), err.message])
        );

        setFormState((prev) => ({
          ...prev,
          errors,
          touched: Object.keys(prev.values).reduce(
            (acc, key) => ({
              ...acc,
              [key]: true,
            }),
            {}
          ),
        }));
      }
      return false;
    }
  }, [formState.values]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setFormState((prev) => ({ ...prev, isSubmitting: true }));

      // Transform form data to contact schema
      const baseContactData = transformFormToContact(formState.values);

      let response;
      if (initialContact?._id) {
        // For updates, include the _id and timestamps
        const updateData = {
          ...baseContactData,
          _id: initialContact._id,
          createdAt: initialContact.createdAt,
          updatedAt: new Date(),
        };
        console.log("Sending update with data:", updateData);
        response = await updateContact(updateData);
      } else {
        // For new contacts, let the server handle timestamps
        response = await createContact(baseContactData);
      }

      if (!response.success) {
        throw new Error(response.error || "Operation failed");
      }

      toast.success(
        initialContact
          ? "Contact updated successfully"
          : "Contact created successfully"
      );
      setFormState((prev) => ({ ...prev, isDirty: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save contact";
      toast.error(errorMessage);
      console.error("Submit error:", error);
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [validateForm, formState.values, initialContact]);

  const resetForm = useCallback(() => {
    setFormState({
      values: initialContact
        ? transformContactToForm(initialContact)
        : {
            "general.firstName": "",
            "general.lastName": "",
            "general.email": "",
            "general.phone": "",
            currency: "EUR",
          },
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialContact]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isDirty: formState.isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
