const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

// Format date to a readable string
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Send reminder email notification
const sendReminderEmail = async (reminder, user) => {
  try {
    let emailContent = `
      Hi ${user.name},

      This is a reminder for: ${reminder.title}
      
      Due date: ${formatDate(reminder.dueDate)}
      Priority: ${reminder.priority}
    `;

    if (reminder.description) {
      emailContent += `\nDetails: ${reminder.description}`;
    }

    let jobInfo = '';
    let contactInfo = '';

    // If reminder is linked to a job, add job info
    if (reminder.job) {
      const job = await Reminder.findById(reminder._id).populate('job', 'company title').exec();
      if (job.job) {
        jobInfo = `\nRelated job: ${job.job.company} - ${job.job.title}`;
      }
    }

    // If reminder is linked to a contact, add contact info
    if (reminder.contact) {
      const contact = await Reminder.findById(reminder._id).populate('contact', 'name company').exec();
      if (contact.contact) {
        contactInfo = `\nRelated contact: ${contact.contact.name} (${contact.contact.company})`;
      }
    }

    emailContent += jobInfo + contactInfo;

    emailContent += `
      
      You can view and manage this reminder in your JobTracker application.
      
      Best regards,
      Your JobTracker App
    `;

    // Build HTML version
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a6ee0;">Reminder: ${reminder.title}</h2>
        <p>Hi ${user.name},</p>
        <p>This is a reminder for your upcoming task.</p>
        
        <div style="background-color: #f7f9fc; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Due date:</strong> ${formatDate(reminder.dueDate)}</p>
          <p><strong>Priority:</strong> 
            <span style="
              display: inline-block; 
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 12px;
              background-color: ${
                reminder.priority === 'High' ? '#fee2e2' : 
                reminder.priority === 'Medium' ? '#fef3c7' : '#dcfce7'
              }; 
              color: ${
                reminder.priority === 'High' ? '#dc2626' : 
                reminder.priority === 'Medium' ? '#d97706' : '#059669'
              };"
            >
              ${reminder.priority}
            </span>
          </p>
          ${reminder.description ? `<p><strong>Details:</strong> ${reminder.description}</p>` : ''}
          ${jobInfo ? `<p><strong>Related job:</strong> ${jobInfo.replace('\\nRelated job: ', '')}</p>` : ''}
          ${contactInfo ? `<p><strong>Related contact:</strong> ${contactInfo.replace('\\nRelated contact: ', '')}</p>` : ''}
        </div>
        
        <p>You can view and manage this reminder in your JobTracker application.</p>
        
        <p style="margin-top: 20px;">Best regards,<br>Your JobTracker App</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: `Reminder: ${reminder.title}`,
      text: emailContent,
      html: htmlContent
    });

    // Update the reminder to mark as sent
    await Reminder.findByIdAndUpdate(reminder._id, {
      emailSent: true,
      lastNotificationSent: new Date()
    });

    console.log(`Reminder email sent to ${user.email} for reminder: ${reminder.title}`);
    
    // If this is a repeating reminder, calculate and set the next notification date
    if (reminder.repeating && reminder.repeatFrequency !== 'None') {
      const nextDate = calculateNextReminderDate(reminder);
      await Reminder.findByIdAndUpdate(reminder._id, {
        remindAt: nextDate,
        emailSent: false,
        nextNotificationDate: nextDate
      });
      
      console.log(`Next notification for reminder "${reminder.title}" scheduled for: ${nextDate}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

// Calculate the next reminder date based on frequency
const calculateNextReminderDate = (reminder) => {
  const now = new Date();
  let nextDate = new Date(now);

  switch (reminder.repeatFrequency) {
    case 'Daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'Weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'Bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'Monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      return null;
  }

  return nextDate;
};

// Check for due reminders and send notifications
const checkAndSendReminders = async () => {
  const now = new Date();
  
  try {
    console.log(`Checking for reminders at ${now.toISOString()}`);
    
    // Find reminders that need notifications
    const reminders = await Reminder.find({
      remindAt: { $lte: now },
      $or: [
        { notificationType: 'Email' },
        { notificationType: 'Both' }
      ],
      emailSent: false,
      completed: false
    });
    
    console.log(`Found ${reminders.length} reminders to send`);
    
    // Send notifications for each reminder
    for (const reminder of reminders) {
      // Get the user for this reminder
      const user = await User.findById(reminder.user);
      
      if (!user) {
        console.log(`User not found for reminder ${reminder._id}`);
        continue;
      }
      
      await sendReminderEmail(reminder, user);
    }
    
    return true;
  } catch (error) {
    console.error('Error checking and sending reminders:', error);
    return false;
  }
};

// Initialize the cron job for reminder notifications
const initReminderNotifications = () => {
  // Run every minute to check for reminders
  cron.schedule('* * * * *', async () => {
    await checkAndSendReminders();
  });
  
  console.log('Reminder notification service initialized');
};

module.exports = {
  initReminderNotifications,
  sendReminderEmail,
  checkAndSendReminders
}; 