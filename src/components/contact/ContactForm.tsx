"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactsData } from "@/context/DataContext";
import { toast } from "sonner";

// Define exact form structure
interface ContactFormData {
  general: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  currency: string;
}

const INITIAL_FORM_STATE: ContactFormData = {
  general: {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  },
  currency: 'EUR'
};

const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP'] as const;

export function ContactForm() {
  const {
    selectedItem,
    updateItem,
    createItem,
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges
  } = useContactsData();

  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map MongoDB data to form structure
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        general: {
          firstName: selectedItem.general?.firstName || '',
          lastName: selectedItem.general?.lastName || '',
          email: selectedItem.general?.email || '',
          phone: selectedItem.general?.phone || ''
        },
        currency: selectedItem.currency || 'EUR'
      });
      setTouched(new Set());
      setErrors({});
    }
  }, [selectedItem]);

  const handleChange = (section: keyof ContactFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: section === 'general' 
        ? { ...prev.general, [field]: value }
        : value
    }));

    setPendingChanges(prev => ({
      ...prev,
      [`${section}.${field}`]: {
        oldValue: selectedItem?.[section]?.[field] || '',
        newValue: value
      }
    }));
  };

  const handleBlur = (fieldPath: string) => {
    setTouched(prev => new Set(prev).add(fieldPath));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const itemData = {
        ...selectedItem,
        ...formData
      };

      if (selectedItem?._id) {
        const result = await updateItem(itemData);
        if (result) {
          toast.success('Contact updated successfully');
        } else {
          toast.error('Failed to update contact');
        }
      } else {
        const result = await createItem(itemData);
        if (result) {
          toast.success('Contact created successfully');
        } else {
          toast.error('Failed to create contact');
        }
      }
      setIsEditing(false);
      setPendingChanges({});
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (selectedItem) {
      setFormData({
        general: {
          firstName: selectedItem.general?.firstName || '',
          lastName: selectedItem.general?.lastName || '',
          email: selectedItem.general?.email || '',
          phone: selectedItem.general?.phone || ''
        },
        currency: selectedItem.currency || 'EUR'
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSave} className="contact-form">
      <div className="form-header">
        <h2 className="form-title">
          {selectedItem?._id ? "Contact Details" : "New Contact"}
        </h2>
        <div className="form-actions">
          {!isEditing && selectedItem?._id && (
            <Button icon={Edit} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}

          {isEditing && (
            <>
              <Button
                icon={Save}
                type="submit"
                disabled={isSubmitting || Object.keys(pendingChanges).length === 0}
              >
                Save
              </Button>
              <Button
                intent="secondary"
                icon={X}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="form-sections">
        <div className="form-section">
          <h3 className="section-title">General Information</h3>
          <div className="section-fields">
            <div className="form-field">
              <label className="field-label">
                First Name
              </label>
              <input
                type="text"
                className="input-base input-style"
                value={formData.general.firstName}
                onChange={(e) => handleChange('general', 'firstName', e.target.value)}
                onBlur={() => handleBlur('general.firstName')}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-field">
              <label className="field-label">
                Last Name
              </label>
              <input
                type="text"
                className="input-base input-style"
                value={formData.general.lastName}
                onChange={(e) => handleChange('general', 'lastName', e.target.value)}
                onBlur={() => handleBlur('general.lastName')}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-field">
              <label className="field-label">Email</label>
              <input
                type="email"
                className="input-base input-style"
                value={formData.general.email}
                onChange={(e) => handleChange('general', 'email', e.target.value)}
                onBlur={() => handleBlur('general.email')}
                disabled={!isEditing}
              />
            </div>
            <div className="form-field">
              <label className="field-label">Phone</label>
              <input
                type="tel"
                className="input-base input-style"
                value={formData.general.phone}
                onChange={(e) => handleChange('general', 'phone', e.target.value)}
                onBlur={() => handleBlur('general.phone')}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          <div className="section-fields">
            <div className="form-field">
              <label className="field-label">
                Currency
                <span className="required-mark">*</span>
              </label>
              <select
                className="input-base input-style"
                value={formData.currency}
                onChange={(e) => handleChange('currency', '', e.target.value)}
                onBlur={() => handleBlur('currency')}
                disabled={!isEditing}
                required
              >
                {CURRENCY_OPTIONS.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}