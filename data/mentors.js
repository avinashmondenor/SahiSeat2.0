export const CATEGORIES = [
  { id: "choice-filling", name: "Choice Filling", icon: "ListChecks", desc: "Lock the perfect choice list" },
  { id: "placements", name: "Placements", icon: "TrendingUp", desc: "Inside track on salaries & offers" },
  { id: "hostel-life", name: "Hostel Life", icon: "Building2", desc: "Mess food, rooms & campus culture" },
  { id: "coding", name: "Coding & Dev", icon: "Code", desc: "GSOC, CP, Web Dev roadmap" },
  { id: "academics", name: "Academics", icon: "BookOpen", desc: "GPA maintenance & study tips" },
  { id: "internships", name: "Internships", icon: "Briefcase", desc: "Landing summer opportunities" },
  { id: "campus-life", name: "Campus Life", icon: "MapPin", desc: "Fests, clubs, and work-life balance" },
  { id: "higher-studies", name: "Higher Studies", icon: "GraduationCap", desc: "GATE, MS, MBA guidance" },
];

export const MENTORS = [
  {
    id: "m1",
    name: "Aarav Sharma",
    college: "IIIT Vadodara",
    branch: "Computer Science & Engineering",
    rating: 5.0,
    ratingCount: 34,
    price: 199,
    tags: ["Choice Filling", "Placements", "Coding & Dev"],
    verified: true,
    avatarGradient: "from-indigo-500 via-purple-500 to-pink-500",
    initials: "AS",
    about: "Hey! I'm a final-year CSE student at IIIT Vadodara. I secured a 14 LPA offer at a top tech startup and have mentored over 50+ freshers on choice-filling. Let me help you optimize your seat selections!",
    slots: {
      "Tomorrow": ["10:00 AM", "2:00 PM", "6:00 PM"],
      "Day after tomorrow": ["11:00 AM", "4:00 PM", "7:30 PM"],
      "Next Monday": ["3:00 PM", "5:00 PM", "8:00 PM"]
    }
  },
  {
    id: "m2",
    name: "Priya Patel",
    college: "IIT Bombay",
    branch: "Electrical Engineering",
    rating: 4.9,
    ratingCount: 48,
    price: 249,
    tags: ["Academics", "Internships", "Higher Studies"],
    verified: true,
    avatarGradient: "from-blue-600 to-cyan-500",
    initials: "PP",
    about: "Third-year EE student at IIT Bombay. Secured an off-campus research internship at TU Delft. If you want to know about research prospects, core EE placements, or balancing GPA, let's talk.",
    slots: {
      "Tomorrow": ["4:00 PM", "5:00 PM", "6:00 PM"],
      "Day after tomorrow": ["9:00 AM", "1:00 PM", "8:00 PM"],
      "Next Monday": ["10:00 AM", "2:00 PM"]
    }
  },
  {
    id: "m3",
    name: "Rohan Das",
    college: "NIT Trichy",
    branch: "Information Technology",
    rating: 5.0,
    ratingCount: 29,
    price: 199,
    tags: ["Placements", "Coding & Dev", "Internships"],
    verified: true,
    avatarGradient: "from-emerald-400 to-teal-700",
    initials: "RD",
    about: "Software Engineer Intern @ Microsoft. Cracking coding rounds, building resumes, and navigating NIT Trichy placements can be daunting. Let's demystify it together.",
    slots: {
      "Tomorrow": ["1:00 PM", "3:00 PM", "9:00 PM"],
      "Day after tomorrow": ["10:00 AM", "6:00 PM", "9:00 PM"],
      "Next Monday": ["4:00 PM", "7:00 PM", "9:00 PM"]
    }
  },
  {
    id: "m4",
    name: "Sneha Reddy",
    college: "NIT Surathkal",
    branch: "Electronics & Communication",
    rating: 4.8,
    ratingCount: 22,
    price: 199,
    tags: ["Choice Filling", "Hostel Life", "Campus Life"],
    verified: true,
    avatarGradient: "from-orange-400 via-red-500 to-pink-500",
    initials: "SR",
    about: "Final-year ECE student. I served as the cultural club head at NITK. Talk to me if you want to know about the incredible beach campus life, ECE workload, or JoSAA category preferences.",
    slots: {
      "Tomorrow": ["2:00 PM", "5:00 PM"],
      "Day after tomorrow": ["3:00 PM", "6:00 PM", "8:00 PM"],
      "Next Monday": ["11:00 AM", "12:00 PM", "5:00 PM"]
    }
  },
  {
    id: "m5",
    name: "Karan Malhotra",
    college: "IIIT Allahabad",
    branch: "Information Technology",
    rating: 5.0,
    ratingCount: 56,
    price: 249,
    tags: ["Coding & Dev", "Placements", "Academics"],
    verified: true,
    avatarGradient: "from-violet-600 to-indigo-900",
    initials: "KM",
    about: "Competitive programmer (Candidate Master on Codeforces). If you are aiming for high-ticket coding placements or GSoC during IIIT Allahabad's rigorous curriculum, I can guide you.",
    slots: {
      "Tomorrow": ["8:00 PM", "9:00 PM", "10:00 PM"],
      "Day after tomorrow": ["8:00 PM", "9:00 PM"],
      "Next Monday": ["7:00 PM", "9:00 PM", "10:00 PM"]
    }
  },
  {
    id: "m6",
    name: "Ananya Iyer",
    college: "IIT Madras",
    branch: "Mechanical Engineering",
    rating: 4.9,
    ratingCount: 19,
    price: 249,
    tags: ["Higher Studies", "Campus Life", "Internships"],
    verified: true,
    avatarGradient: "from-fuchsia-500 via-red-600 to-orange-400",
    initials: "AI",
    about: "Pursuing non-core consulting placements and higher studies prep (CAT 99.4 percentile). IIT Madras has a unique ecosystem; let me help you figure out how to transition from core to management.",
    slots: {
      "Tomorrow": ["11:00 AM", "12:00 PM"],
      "Day after tomorrow": ["2:00 PM", "4:00 PM"],
      "Next Monday": ["10:00 AM", "6:00 PM"]
    }
  },
  {
    id: "m7",
    name: "Vikram Singh",
    college: "DTU Delhi",
    branch: "Software Engineering",
    rating: 4.7,
    ratingCount: 15,
    price: 199,
    tags: ["Placements", "Hostel Life", "Choice Filling"],
    verified: true,
    avatarGradient: "from-cyan-400 via-blue-500 to-indigo-600",
    initials: "VS",
    about: "DTU SE student. Delhi region choice filling can be tricky. I can advise you on DTU vs NSUT vs IIIT Delhi, and what companies visit DTU for tech roles.",
    slots: {
      "Tomorrow": ["3:00 PM", "6:00 PM"],
      "Day after tomorrow": ["1:00 PM", "5:00 PM", "7:00 PM"],
      "Next Monday": ["2:00 PM", "4:00 PM"]
    }
  },
  {
    id: "m8",
    name: "Meera Nair",
    college: "IIIT Vadodara",
    branch: "Computer Science & Engineering",
    rating: 4.9,
    ratingCount: 26,
    price: 199,
    tags: ["Choice Filling", "Academics", "Hostel Life"],
    verified: true,
    avatarGradient: "from-rose-400 via-pink-500 to-red-500",
    initials: "MN",
    about: "Helping female candidates navigate JoSAA supernumerary seats. I live in the IIIT Vadodara hostels and can give you a transparent review of mess food, girls' safety, and academic guidelines.",
    slots: {
      "Tomorrow": ["4:00 PM", "7:00 PM"],
      "Day after tomorrow": ["2:00 PM", "6:00 PM"],
      "Next Monday": ["10:00 AM", "1:00 PM", "5:00 PM"]
    }
  },
  {
    id: "m9",
    name: "Aditya Verma",
    college: "NIT Warangal",
    branch: "Computer Science & Engineering",
    rating: 5.0,
    ratingCount: 41,
    price: 249,
    tags: ["Coding & Dev", "Placements", "Internships"],
    verified: true,
    avatarGradient: "from-amber-400 via-orange-500 to-yellow-600",
    initials: "AV",
    about: "CSE student at NIT Warangal. Placed at Oracle. I specialize in backend engineering roadmaps and cracking DSA interviews during college. Let's connect!",
    slots: {
      "Tomorrow": ["5:00 PM", "7:00 PM", "9:00 PM"],
      "Day after tomorrow": ["6:00 PM", "8:00 PM"],
      "Next Monday": ["4:00 PM", "6:00 PM", "8:00 PM"]
    }
  }
];

export const REVIEWS = [
  {
    id: "r1",
    author: "Rahul Keshav",
    college: "IIT Madras (Joined 2025)",
    rating: 5,
    text: "Priya helped me structure my preference list. I was confused between IIT Roorkee Chemical and IIT Madras Mechanical. Her advice on campus culture and branch change guidelines was gold.",
    mentorName: "Priya Patel"
  },
  {
    id: "r2",
    author: "Shreya Ghoshal",
    college: "NIT Trichy (Joined 2025)",
    rating: 5,
    text: "Rohan gave me a clear roadmap for coding round preparation. His Microsoft interview tips and referral advice saved me months of guessing. Highly recommend a session!",
    mentorName: "Rohan Das"
  },
  {
    id: "r3",
    author: "Devendra Pratap",
    college: "IIIT Vadodara (Joined 2025)",
    rating: 5,
    text: "Aarav walked me through the CSAB spot round rules. He literally saved me from losing my seat by explaining the float vs slide rules. Great mentor, super friendly.",
    mentorName: "Aarav Sharma"
  },
  {
    id: "r4",
    author: "Nikita Sen",
    college: "NIT Surathkal (Joined 2025)",
    rating: 4,
    text: "Sneha was so helpful. I had questions about girl-hostel rules and internet speed at NITK. She answered everything patiently and also reviewed my choice list.",
    mentorName: "Sneha Reddy"
  },
  {
    id: "r5",
    author: "Amit Singhal",
    college: "IIIT Allahabad (Joined 2025)",
    rating: 5,
    text: "Karan's insight on CP culture at IIIT Allahabad was eye-opening. If you are serious about competitive coding, booking him is a no-brainer.",
    mentorName: "Karan Malhotra"
  }
];

export const FAQS = [
  {
    question: "How do I connect with the senior after booking?",
    answer: "Once your booking is confirmed, you will receive an email and SMS with a Google Meet link, along with a calendar invite. The senior will join the link at the scheduled time."
  },
  {
    question: "What if I need to reschedule the session?",
    answer: "You can reschedule your session up to 4 hours before the slot. Just click the reschedule link in your confirmation email and pick a new slot."
  },
  {
    question: "Are these seniors actually verified?",
    answer: "Yes, absolutely. Every mentor on SahiSeat goes through a verification process where they must verify using their official college email ID (e.g. name@iiitv.ac.in) and upload their college ID card. We ensure only genuine students are listing."
  },
  {
    question: "Can I get a refund if the senior does not join?",
    answer: "Yes, we have a 100% money-back guarantee. If a senior does not show up within 10 minutes of the scheduled time, we refund your booking amount instantly with no questions asked."
  },
  {
    question: "What topics can I discuss in the session?",
    answer: "You can discuss choice filling strategies, branch vs college trade-offs, placements, hostel food, campus culture, coding environment, or anything else you'd like to know about the college."
  }
];
