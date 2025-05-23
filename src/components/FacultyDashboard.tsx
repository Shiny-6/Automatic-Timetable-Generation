// FacultyDashboard Component
// This component provides faculty members with an interface to view their assigned timetables
// and manage their teaching schedules. It displays all timetables assigned to the faculty member
// and allows them to select and print specific timetables.

// Import React hooks and routing utilities
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Import UI components from shadcn/ui
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import icons from lucide-react
import { Calendar, FileDown, Info, Printer } from 'lucide-react';

// Import custom hooks and utilities
import { useAuth } from '@/contexts/AuthContext'; // For authentication context
import { getTimetablesForFaculty } from '@/utils/timetableUtils'; // Timetable data utilities
import { Timetable } from '@/utils/types'; // Type definitions
import TimetableView from './TimetableView'; // Custom timetable view component
import { useToast } from '@/hooks/use-toast'; // Toast notification system

const FacultyDashboard: React.FC = () => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  
  // Get current faculty username from auth context
  const { username } = useAuth();
  
  // Toast notification system for user feedback
  const { toast } = useToast();
  
  // Ref for the printable timetable content
  const printRef = useRef<HTMLDivElement>(null);
  
  // State for storing all timetables assigned to this faculty
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  
  // State for tracking the currently selected timetable
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  
  // Effect hook to load timetables when username changes
useEffect(() => {
  if (username) {
    console.log("Fetching timetables for faculty:", username);
    
    // Fetch all timetables assigned to this faculty member
    const facultyTimetables = getTimetablesForFaculty(username);
    console.log("Found timetables:", facultyTimetables);
    
    // Show notification if no timetables are found
    if (facultyTimetables.length === 0) {
      toast({
        title: "No timetables found",
        description: `No timetables were found for faculty: ${username}`,
        variant: "default",
      });
    }
    
    // Update timetables state
    setTimetables(facultyTimetables);
    
    // Set the first timetable as selected by default if available
    if (facultyTimetables.length > 0) {
      setSelectedTimetable(facultyTimetables[0]);
    } else {
      setSelectedTimetable(null);
    }
  }
}, [username, toast]); // Dependencies: runs when username or toast changes
  
  // Handler for selecting a timetable from the list
const handleSelectTimetable = (timetable: Timetable) => {
  setSelectedTimetable(timetable);
};
  
  // Handler for printing the selected timetable
const handlePrint = () => {
  // Early return if no timetable is selected or print ref is not available
  if (!selectedTimetable || !printRef.current) return;
  
  // Open a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Show error if window couldn't be opened (likely due to popup blocker)
  if (!printWindow) {
    toast({
      title: "Error",
      description: "Could not open print window. Please check your popup settings.",
      variant: "destructive"
    });
    return;
  }
    
    // Create a simplified and clean printable view
    printWindow.document.write(`
      <html>
        <head>
          <title>Faculty Timetable - ${username}</title>
          <style>
            @page {
              size: landscape;
              margin: 0.5cm;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 15px;
              margin: 0 auto;
              font-size: 14px;
              max-width: 50%;
            }
            .print-header {
              text-align: center;
              margin-bottom: 15px;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 8px;
            }
            .logo {
              width: 60px;
              height: 60px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0 auto 15px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px 6px;
              text-align: center;
              height: 24px;
              vertical-align: middle;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
              font-size: 11px;
            }
            .break-slot, .lunch-slot {
              background-color: #f5f5f5;
              font-style: italic;
            }
            .free-slot {
              background-color: #e6f7ff;
            }
            .lab-slot {
              background-color: #e6ffe6;
              font-weight: 500;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .faculty-details {
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .subject-item {
              margin-bottom: 5px;
            }
            .print-button {
              display: block;
              margin: 20px auto;
              padding: 8px 16px;
              background-color: #4f46e5;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="logo-container">
              <img src="/images/college logo.jpg" class="logo" alt="College Logo">
            </div>
            <h2 style="margin-bottom: 5px; font-size: 16px;">University College of Engineering & Technology for Women</h2>
            <p style="margin-top: 0; margin-bottom: 8px; font-size: 12px;">Kakatiya University Campus, Warangal (T.S) - 506009</p>
            <h3 style="margin-top: 0; margin-bottom: 5px; text-decoration: underline; font-size: 14px;">
              Faculty Timetable - ${username}
            </h3>
            <p style="margin-top: 0; margin-bottom: 10px; font-size: 12px;">
              Academic Year: ${selectedTimetable.formData.academicYear}
            </p>
          </div>

          ${printRef.current.innerHTML}
          
          <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">
            Print Timetable
          </button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl bg-white p-2 rounded-xl font-bold">Faculty Dashboard</h1>
        <div className="text-sm bg-white p-2 rounded-full">
          Logged in as: <span className="font-medium  text-foreground">{username}</span>
        </div>
      </div>
      
      {timetables.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Info className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No timetables assigned</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                You don't have any classes assigned in the current timetables. Please check back later or contact the administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg bg-white p-2 rounded-xl font-medium">Your Timetables</h2>
            {timetables.map((timetable) => (
              <Card 
                key={timetable.id}
                className={`cursor-pointer transition-colors ${
                  selectedTimetable?.id === timetable.id ? 'border-primary' : ''
                }`}
                onClick={() => handleSelectTimetable(timetable)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {timetable.formData.year}, {timetable.formData.branch}
                  </CardTitle>
                  <CardDescription>
                    {timetable.formData.courseName}, Semester {timetable.formData.semester}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Room:</span> {timetable.formData.roomNumber}
                    </div>
                    <div>
                      <span className="font-medium">Academic Year:</span> {timetable.formData.academicYear}
                    </div>
                    <div>
                      <span className="font-medium">Classes:</span> {timetable.entries.filter(entry => 
                        entry.teacherName === username && !entry.isBreak && !entry.isLunch
                      ).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-2">
            {selectedTimetable ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg bg-white p-2 rounded-xl font-medium">Your Schedule</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center border p-2 border-black bg-green-300 text-black gap-1"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4" />
                    Print Timetable
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 bg-white print:border-none" ref={printRef}>
                  <div className="mb-4 print:mb-6">
                    <h3 className="font-bold text-center text-lg">
                      {selectedTimetable.formData.courseName} - {selectedTimetable.formData.year} - {selectedTimetable.formData.branch} - Semester {selectedTimetable.formData.semester}
                    </h3>
                    <p className="text-center text-sm text-black">
                      Academic Year: {selectedTimetable.formData.academicYear} | Room: {selectedTimetable.formData.roomNumber}
                    </p>
                    <p className="text-center text-sm font-medium mt-2">
                      Faculty View: {username}
                    </p>
                  </div>
                  
                  <TimetableView 
                    timetable={selectedTimetable} 
                    facultyFilter={username}
                  />
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center p-8 space-y-3">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Select a timetable</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a timetable from the left to view your teaching schedule
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
