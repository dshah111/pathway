import jsPDF from 'jspdf';

// Helper function to capitalize track name
function capitalizeTrack(track: string): string {
  const trackMap: Record<string, string> = {
    'high-school': 'High School',
    'university': 'University',
    'masters': 'Masters',
  };
  return trackMap[track] || track.charAt(0).toUpperCase() + track.slice(1).replace(/-/g, ' ');
}

export function generatePlanPDF(plan: any): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Use Helvetica font (professional and easy to read)
  doc.setFont('helvetica');

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(plan.name || plan.planName || 'Academic Plan', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Plan Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const trackName = plan.track ? capitalizeTrack(plan.track) : 'N/A';
  doc.text(`Track: ${trackName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total Credits: ${plan.totalCredits || 0}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total Courses: ${plan.totalCourses || 0}`, 20, yPosition);
  yPosition += 7;
  if (plan.savedDate) {
    const date = new Date(plan.savedDate).toLocaleDateString();
    doc.text(`Saved: ${date}`, 20, yPosition);
    yPosition += 10;
  }

  // Semesters
  if (plan.semesters && plan.semesters.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Semesters', 20, yPosition);
    yPosition += 10;

    plan.semesters.forEach((semester: any, index: number) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${semester.title} - ${semester.subtitle}`, 20, yPosition);
      yPosition += 7;

      const semesterCredits = semester.courses?.reduce((sum: number, c: any) => sum + (c.credits || 0), 0) || 0;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Credits: ${semesterCredits}`, 25, yPosition);
      yPosition += 7;

      // Courses
      if (semester.courses && semester.courses.length > 0) {
        semester.courses.forEach((course: any) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          // Format: "Course Code: Course Name" if code exists, otherwise just "Course Name"
          const courseDisplay = course.code ? `${course.code}: ${course.name}` : course.name;
          const courseText = `  • ${courseDisplay} (${course.credits} ${course.credits === 1 ? 'credit' : 'credits'})`;
          doc.text(courseText, 25, yPosition);
          yPosition += 6;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('  No courses', 25, yPosition);
        yPosition += 6;
      }

      yPosition += 5; // Space between semesters
    });
  }

  // Save the PDF
  const fileName = `${(plan.name || plan.planName || 'plan').replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(fileName);
}

