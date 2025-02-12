"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactsData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefFields";
import { searchDocuments } from "@/app/actions/crudActions";

interface SearchResult {
 _id: string;
 [key: string]: any;
}

interface ContactFormData {
 general: {
   firstName: string;
   lastName: string;
   email: string;
   phone: string;
   type: string;
   bookerId: string;
   bookerName: string;
 };
}

const INITIAL_FORM_STATE: ContactFormData = {
 general: {
   firstName: "",
   lastName: "",
   email: "",
   phone: "",
   type: "",
   bookerId: "",
   bookerName: "",
 },
};

const TYPE_OPTIONS = [
 { value: "a", label: "A" },
 { value: "b", label: "B" },
 { value: "c", label: "C" },
];

export function ContactForm() {
 const {
   selectedItem,
   updateItem,
   createItem,
   setIsEditing,
   isEditing,
   pendingChanges,
   setPendingChanges,
 } = useContactsData();

 const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const handleChange = (
   section: keyof ContactFormData,
   field: string,
   value: string,
   displayValue?: string
 ) => {
   if (section === "general") {
     setFormData((prev) => ({
       ...prev,
       general: {
         ...prev.general,
         [field]: value,
         ...(displayValue && field === "bookerId" ? { bookerName: displayValue } : {}),
       },
     }));
   }

   setPendingChanges((prev) => ({
     ...prev,
     [`${section}.${field}`]: {
       oldValue: selectedItem?.[section]?.[field] || "",
       newValue: value,
     },
   }));
 };

 useEffect(() => {
   if (selectedItem) {
     const loadBookerDetails = async () => {
       if (selectedItem.general?.bookerId) {
         try {
           const results = await searchDocuments<SearchResult>(
             'bookings',
             selectedItem.general.bookerId,
             '_id'
           );
           if (results.length > 0) {
             setFormData(prev => ({
               general: {
                 ...prev.general,
                 bookerName: results[0].name
               }
             }));
           }
         } catch (error) {
           console.error('Failed to load booking details:', error);
         }
       }
     };

     setFormData({
       general: {
         firstName: selectedItem.general?.firstName || "",
         lastName: selectedItem.general?.lastName || "",
         email: selectedItem.general?.email || "",
         phone: selectedItem.general?.phone || "",
         type: selectedItem.general?.type || "",
         bookerId: selectedItem.general?.bookerId || "",
         bookerName: selectedItem.general?.bookerName || "",
       },
     });

     if (selectedItem.general?.bookerId) {
       loadBookerDetails();
     }
   }
 }, [selectedItem]);

 const handleSave = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsSubmitting(true);

   try {
     const itemData = {
       ...selectedItem,
       general: {
         ...formData.general,
         bookerName: undefined
       }
     };

     const success = selectedItem?._id
       ? await updateItem(itemData)
       : await createItem(itemData);

     if (success) {
       toast.success(
         `Contact ${selectedItem?._id ? "updated" : "created"} successfully`
       );
       setIsEditing(false);
       setPendingChanges({});
     } else {
       toast.error(
         `Failed to ${selectedItem?._id ? "update" : "create"} contact`
       );
     }
   } catch (error) {
     toast.error("An unexpected error occurred");
   } finally {
     setIsSubmitting(false);
   }
 };

 const handleCancel = () => {
   if (selectedItem) {
     setFormData({
       general: {
         firstName: selectedItem.general?.firstName || "",
         lastName: selectedItem.general?.lastName || "",
         email: selectedItem.general?.email || "",
         phone: selectedItem.general?.phone || "",
         type: selectedItem.general?.type || "",
         bookerId: selectedItem.general?.bookerId || "",
         bookerName: selectedItem.general?.bookerName || "",
       },
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
       <p className="form-title">
         {selectedItem?._id ? "Contact Details" : "New Contact"}
       </p>
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
         <div className="section-fields">
           <TextField
             label="First Name"
             value={formData.general.firstName}
             onChange={(value) => handleChange("general", "firstName", value)}
             required
             isEditing={isEditing}
             className={pendingChanges[`general.firstName`] ? "field-changed" : ""}
           />
           <RefField
             label="Booking"
             value={formData.general.bookerId}
             onChange={(value, displayValue) => 
               handleChange("general", "bookerId", value, displayValue)
             }
             required
             isEditing={isEditing}
             className={pendingChanges[`general.bookerId`] ? "field-changed" : ""}
             collectionName="bookings"
             displayField="name"
             selectedLabel={formData.general.bookerName}
           />
           <TextField
             label="Last Name"
             value={formData.general.lastName}
             onChange={(value) => handleChange("general", "lastName", value)}
             required
             isEditing={isEditing}
             className={pendingChanges[`general.lastName`] ? "field-changed" : ""}
           />
           <TextField
             label="Email"
             value={formData.general.email}
             onChange={(value) => handleChange("general", "email", value)}
             type="email"
             isEditing={isEditing}
             className={pendingChanges[`general.email`] ? "field-changed" : ""}
           />
           <TextField
             label="Phone"
             value={formData.general.phone}
             onChange={(value) => handleChange("general", "phone", value)}
             type="tel"
             isEditing={isEditing}
             className={pendingChanges[`general.phone`] ? "field-changed" : ""}
           />
           <DropdownField
             label="type"
             value={formData.general.type}
             onChange={(value) => handleChange("general", "type", value)}
             options={TYPE_OPTIONS}
             required
             isEditing={isEditing}
             className={pendingChanges[`general.type`] ? "field-changed" : ""}
           />
         </div>
       </div>
     </div>
   </form>
 );
}