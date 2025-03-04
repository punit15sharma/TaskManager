const PROJECTS = {
   'anomaly-trig': { name: 'Anomaly Trig.', color: '#3b82f6' },
   'vll-dp': { name: 'VLL DP', color: '#ef4444' },
   'qiml': { name: 'QiML', color: '#8b5cf6' },
   'misc-atlas': { name: 'Misc. ATLAS', color: '#f59e0b' },
   'other': { name: 'Other', color: '#6b7280' }
};

const calculatePriority = (task) => {
   const daysSinceCreation = (new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24);
   const ageFactor = Math.min(daysSinceCreation / 7 * 0.5, 2);
   const quickBonus = task.length <= 2 ? 1.5 : 0;
   const easyBonus = task.difficulty <= 2 ? 1 : 0;
   const basePriority = (task.importance * 2) - (task.length + task.difficulty) / 3;
   
   // Deadline factor
   let deadlineFactor = 0;
   if (task.deadline) {
       const daysUntilDeadline = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24);
       // Exponential increase as deadline approaches
       if (daysUntilDeadline < 0) {
           deadlineFactor = 5; // Overdue tasks get high priority
       } else if (daysUntilDeadline < 7) {
           deadlineFactor = 4 * (1 - daysUntilDeadline/7); // Up to 4 points for urgent tasks
       } else if (daysUntilDeadline < 30) {
           deadlineFactor = 2 * (1 - daysUntilDeadline/30); // Up to 2 points for approaching tasks
       }
       // Factor in task length for deadline urgency
       deadlineFactor *= (1 + task.length/5); // Longer tasks get more deadline pressure
   }

   return (basePriority + ageFactor + quickBonus + easyBonus + deadlineFactor).toFixed(1);
};

const formatDate = (dateString) => {
   const date = new Date(dateString);
   return new Intl.DateTimeFormat('en-US', {
       month: 'short',
       day: 'numeric',
       hour: 'numeric',
       minute: 'numeric'
   }).format(date);
};

const getDaysOld = (dateString) => {
   const days = (new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24);
   return Math.floor(days);
};

const analyzeWorkload = (tasks) => {
   const totalTasks = tasks.length;
   const highPriorityTasks = tasks.filter(t => calculatePriority(t) > 10).length;
   const upcomingDeadlines = tasks.filter(t => {
       if (!t.deadline) return false;
       const daysUntilDeadline = (new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24);
       return daysUntilDeadline < 7;
   }).length;

   // Calculate total workload considering length of each task
   const totalWorkload = tasks.reduce((sum, task) => {
       const lengthWeight = task.length * 0.8;  // Length has more impact
       const priorityBonus = calculatePriority(task) > 10 ? 1.5 : 1;
       const deadlineBonus = task.deadline ?
           ((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24) < 7 ? 1.3 : 1) : 1;
       
       return sum + (lengthWeight * priorityBonus * deadlineBonus);
   }, 0);

   let message, advice;
   if (totalTasks === 0) {
       message = "All clear! 🌟";
       advice = "Enjoy your free time, you've earned it!";
   } 
   else if (totalWorkload > 25) {  // Very high workload
       message = "Your plate is quite full! 🌊";
       advice = "Consider delegating or rescheduling some tasks. Your well-being comes first.";
   }
   else if (totalWorkload > 15) {   // Approaching heavy workload
       message = "Getting busy! 🌱";
       advice = "Be careful about taking on new commitments right now.";
   }
   else if (highPriorityTasks >= 3  && totalWorkload > 10) {
       message = "Some important tasks need attention 📋";
       advice = "Focus on high-priority items first, but take breaks between them.";
   }
   else if (upcomingDeadlines >= 2) {
       message = "Keep an eye on those deadlines ⏰";
       advice = "Plan your week carefully around these key dates.";
   }
   else {
       message = "Workload looks balanced! 💫";
       advice = "You're maintaining a good pace. Keep it up!";
   }
   let workload = "Your workload score is " + Math.round(totalWorkload) + ". 25 is considered impossible.";
   return { message, advice, workload };
};
