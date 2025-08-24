"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import { X, Check, FileDown, Hotel, Calendar, Users } from "lucide-react";

interface Stay {
  _id: string;
  checkInDate?: string;
  checkOutDate?: string;
  hotelName?: string;
  hotelId?: string;
  hotelAddress?: string;
  hotelPostcode?: string;
  hotelCity?: string;
  hotelCountry?: string;
  roomType?: string;
  roomNumber?: string;
  roomPrice?: string;
  roomCurrency?: string;
  paymentType?: string;
  taxAmount?: string;
  taxCurrency?: string;
  reference?: string;
  guestIds?: string[];
  specialRequests?: string;
  remarks?: string;
  paymentInstructions?: string;
  cancellations?: string;
  confirmationNo?: string;
  hotelConfirmationNo?: string;
}

interface StaySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stays: Stay[];
  onGeneratePDF: (selectedStays: Stay[]) => void;
  isGenerating: boolean;
}

export function StaySelectionModal({
  isOpen,
  onClose,
  stays,
  onGeneratePDF,
  isGenerating,
}: StaySelectionModalProps) {
  const [selectedStays, setSelectedStays] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(true);

  // Initialize all stays as selected when modal opens
  useEffect(() => {
    if (isOpen && stays.length > 0) {
      const allStayIds = new Set(stays.map(stay => stay._id));
      setSelectedStays(allStayIds);
      setSelectAll(true);
    }
  }, [isOpen, stays]);

  const handleStayToggle = (stayId: string) => {
    const newSelected = new Set(selectedStays);
    if (newSelected.has(stayId)) {
      newSelected.delete(stayId);
    } else {
      newSelected.add(stayId);
    }
    setSelectedStays(newSelected);
    setSelectAll(newSelected.size === stays.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStays(new Set());
      setSelectAll(false);
    } else {
      const allStayIds = new Set(stays.map(stay => stay._id));
      setSelectedStays(allStayIds);
      setSelectAll(true);
    }
  };

  const handleGeneratePDF = () => {
    const filteredStays = stays.filter(stay => selectedStays.has(stay._id));
    onGeneratePDF(filteredStays);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateNights = (checkInDate?: string, checkOutDate?: string): string => {
    if (!checkInDate || !checkOutDate) return "-";
    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays.toString();
    } catch (error) {
      return "-";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        style={{ 
          maxWidth: '900px', 
          height: 'auto', 
          maxHeight: '85vh',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
              borderRadius: '8px', 
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileDown size={20} color="white" />
            </div>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#1f2937',
                lineHeight: '1.2'
              }}>
                Select Stays for PDF
              </h2>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '0.875rem', 
                color: '#6b7280',
                fontWeight: '400'
              }}>
                Choose which stays to include in your confirmation PDF
              </p>
            </div>
          </div>
          <button 
            className="close-button" 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content" style={{ flex: 1, overflow: 'hidden' }}>
          {/* Select All Section */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '16px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#3b82f6',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontWeight: '600' }}>
                Select All Stays ({stays.length})
              </span>
              <span style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                fontWeight: '400'
              }}>
                • {selectedStays.size} of {stays.length} selected
              </span>
            </label>
          </div>

          {/* Stays List */}
          <div style={{ 
            overflowY: 'auto', 
            maxHeight: '400px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '10px', 
            padding: '12px',
            backgroundColor: '#ffffff'
          }}>
            {stays.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                padding: '40px 20px',
                fontSize: '0.95rem'
              }}>
                <Hotel size={48} style={{ marginBottom: '16px', opacity: '0.5' }} />
                <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>No stays available</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>This booking doesn't have any associated stays.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stays.map((stay) => (
                  <div
                    key={stay._id}
                    style={{
                      padding: '16px',
                      border: selectedStays.has(stay._id) 
                        ? '2px solid #3b82f6' 
                        : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedStays.has(stay._id) 
                        ? '#eff6ff' 
                        : '#ffffff',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => handleStayToggle(stay._id)}
                    onMouseEnter={(e) => {
                      if (!selectedStays.has(stay._id)) {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedStays.has(stay._id)) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    {/* Selection Indicator */}
                    {selectedStays.has(stay._id) && (
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: '#3b82f6',
                        color: 'white',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderBottomLeftRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Check size={12} />
                        Selected
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedStays.has(stay._id)}
                        onChange={() => handleStayToggle(stay._id)}
                        style={{
                          marginTop: '2px',
                          width: '18px',
                          height: '18px',
                          accentColor: '#3b82f6',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Hotel Name and Nights */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          marginBottom: '12px',
                          gap: '12px'
                        }}>
                          <h4 style={{ 
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            lineHeight: '1.3',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {stay.hotelName || 'Unknown Hotel'}
                          </h4>
                          <span style={{ 
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#3b82f6',
                            backgroundColor: '#dbeafe',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap'
                          }}>
                            {calculateNights(stay.checkInDate, stay.checkOutDate)} nights
                          </span>
                        </div>

                        {/* Stay Details Grid */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '12px',
                          fontSize: '0.875rem'
                        }}>
                          {/* Dates */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: '#4b5563'
                          }}>
                            <Calendar size={14} style={{ color: '#6b7280' }} />
                            <div>
                              <div style={{ fontWeight: '500', color: '#374151' }}>
                                {formatDate(stay.checkInDate)} - {formatDate(stay.checkOutDate)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                Check-in to Check-out
                              </div>
                            </div>
                          </div>

                          {/* Guests */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            color: '#4b5563'
                          }}>
                            <Users size={14} style={{ color: '#6b7280' }} />
                            <div>
                              <div style={{ fontWeight: '500', color: '#374151' }}>
                                {stay.guestIds?.length || 0} guest{(stay.guestIds?.length || 0) !== 1 ? 's' : ''}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {stay.roomType ? `${stay.roomType} room` : 'Room details'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price Information */}
                        {stay.roomPrice && (
                          <div style={{ 
                            marginTop: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '6px',
                            border: '1px solid #bbf7d0'
                          }}>
                            <div style={{ 
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#166534'
                            }}>
                              {stay.roomPrice} {stay.roomCurrency || ''} per night
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ 
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              <span style={{ fontWeight: '500' }}>
                {selectedStays.size} of {stays.length} stays selected
              </span>
              {selectedStays.size > 0 && (
                <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                  • PDF will include {selectedStays.size} stay{selectedStays.size !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {selectedStays.size === 0 && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#dc2626',
                fontWeight: '500'
              }}>
                Please select at least one stay
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ 
          marginTop: '24px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button 
            intent="secondary" 
            onClick={onClose} 
            disabled={isGenerating}
            style={{ minWidth: '100px' }}
          >
            Cancel
          </Button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              icon={FileDown}
              onClick={handleGeneratePDF}
              disabled={selectedStays.size === 0 || isGenerating}
              isLoading={isGenerating}
              style={{ minWidth: '180px' }}
            >
              {isGenerating ? "Generating PDF..." : `Generate PDF (${selectedStays.size} stays)`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
