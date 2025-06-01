

// "use client"

// import Image from 'next/image';
// import React from 'react';
// import jenny from "./j.jpg"
// import sufi from "./s.jpg"
// import cc from "./cc.jpeg"
// // import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
// import  { useState } from 'react';
// import { LineChart, Line,    ReferenceLine } from 'recharts';
// import { User, Users, ThumbsDown, Heart, Smile, Frown, X, AlertTriangle, Shield } from 'lucide-react';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// const BestFriendReveal = () => {
//   const data = [
//     { stage: 'Beginning', relationship: 'Haters', level: 10, icon: 'thumbsdown' },
//     { stage: 'Growth', relationship: 'Friends', level: 60, icon: 'users' },
//     { stage: 'Peak', relationship: 'More than Friends', level: 90, icon: 'heart' },
//     { stage: 'Downfall', relationship: 'Haters Again', level: 20, icon: 'thumbsdown' },
//     { stage: 'Confusion', relationship: 'On/Off Friends', level: 45, icon: 'confusion' },
//     { stage: 'Ending', relationship: 'Betrayal', level: 5, icon: 'alert' },
//   ];

//   // Function to render appropriate icon
//   const renderIcon = (type) => {
//     switch(type) {
//       case 'thumbsdown': return <ThumbsDown className="text-red-500" size={18} />;
//       case 'users': return <Users className="text-blue-500" size={18} />;
//       case 'heart': return <Heart className="text-pink-500" size={18} />;
//       case 'confusion': return <div className="flex"><Smile className="text-yellow-500" size={18} /><X className="text-gray-500" size={14} /><Frown className="text-purple-500" size={18} /></div>;
//       case 'alert': return <AlertTriangle className="text-red-600" size={18} />;
//       default: return <User size={18} />;
//     }
//   };

//   // / State for friend's name and photo URL
//   const [friendName, setFriendName] = useState('Your Friend');
//   const [yourName, setYourName] = useState('Your Name');
//   const [note, setNote] = useState('We share a unique bond of understanding and growth.');
  
//   // Factor scores (out of 10)
//   const [deepMindset, setDeepMindset] = useState(9);
//   const [complicatedPersonality, setComplicatedPersonality] = useState(8);
//   const [emotionalAttachment, setEmotionalAttachment] = useState(7);
//   const [sweetJokingValue, setSweetJokingValue] = useState(8);
//   const [loyaltyHonesty, setLoyaltyHonesty] = useState(9);
  
//   // Factor weights
//   const factorWeights = {
//     'Deep Mindset': 0.4,
//     'Complicated Personality': 0.2,
//     'Emotional Attachment': 0.2,
//     'Sweetness & Value': 0.1,
//     'Loyalty & Honesty': 0.1
//   };
  
//   // Calculate the total percentage
//   const calculateTotal = () => {
//     const scores = {
//       'Deep Mindset': deepMindset,
//       'Complicated Personality': complicatedPersonality,
//       'Emotional Attachment': emotionalAttachment,
//       'Sweetness & Value': sweetJokingValue,
//       'Loyalty & Honesty': loyaltyHonesty
//     };
    
//     let total = 0;
//     for (const factor in scores) {
//       const normalizedScore = (scores[factor] / 10); // Convert to a 0-1 scale
//       total += normalizedScore * factorWeights[factor] * 100; // Apply weight and convert to percentage
//     }
    
//     return Math.round(total);
//   };
  
//   const totalScore = calculateTotal();
  
//   // Data for the bar chart
//   const barData = [
//     { name: 'Deep Mindset', value: deepMindset, fill: '#8884d8', maxValue: 10, weight: '40%' },
//     { name: 'Unique Personality', value: complicatedPersonality, fill: '#83a6ed', maxValue: 10, weight: '20%' },

//     { name: 'Emotional Attachment', value: emotionalAttachment, fill: '#8dd1e1', maxValue: 10, weight: '20%' },

//     { name: 'Loyalty & Honesty', value: loyaltyHonesty, fill: '#a4de6c', maxValue: 10, weight: '10%' },
//     { name: 'Sweetness & Value', value: sweetJokingValue, fill: '#82ca9d', maxValue: 10, weight: '10%' },

//     { name: 'Support & Protection', value: loyaltyHonesty, fill: '#2563eb', maxValue: 10, weight: '10%' }
//   ];
  
//   // Data for the pie chart
//   const pieData = barData.map(item => ({
//     name: item.name,
//     value: (item.value / 10) * parseFloat(item.weight), // Weighted value
//     actualWeight: item.weight,
//     actualScore: item.value
//   }));
  
//   const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#2563eb'];
  
//   // Get color based on score
//   const getScoreColor = (score) => {
//     if (score >= 90) return 'text-green-600';
//     if (score >= 75) return 'text-blue-600';
//     if (score >= 60) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   // Categories data from analysis
//   const categories = [
//     { name: "Maturity & Intelligence", value: 5, color: "#8884d8" },
//     { name: "Deep Personality", value: 5, color: "#82ca9d" },
//     { name: "Loyalty & Uniqueness ", value: 2, color: "#ffc658" },
//     { name: "Support & Protection", value: 2, color: "#ff8042" },
//     { name: "Support & Protection", value: 2, color: "#ff8042" }
//   ];

//   // Top qualities to highlight
//   const topQualities = [
//     "Deep Mindset: Kelma possesses an exceptionally intelligent and profound way of thinking.",
//     "Maturity Beyond Age: Her thinking is remarkably mature, despite her youth.",
//     "Emotional Connection: She shares a deep emotional bond and a heart similar to mine.",
//     "Unique Personality: Kelma's personality is complex and distinct, setting her apart.",
//     "Unwavering Strength: She is a strong, resilient person who cannot be easily to win and defeated.",
//     "Loyal Support: Kelma always provides me best support in any situation.",
//     "Shared Loyalty: She treats my friends and enemies as her own, demonstrating rare loyalty.",
//     "Humorous Companion: Her amazing sense of humor brings constant laughter and entertainment.",
//     "Patient Understanding: She shows remarkable patience and understanding, even if i late in reply",
//     "Prioritized Friendship: Kelma always prioritizes me, making me feel special, even among others."
//   ];

//   return (
//     <div className="bg-slate-900 to-purple-100 rounded-xl shadow-xl p-6 ">
//       {/* Header with title and profile images */}
//       <div className="text-center mb-8 ">
//         <h1 className="text-3xl font-bold text-white-800 mb-2">Our Friendship Rollercoaster 🎢</h1>
//         <p className="text-white-600 mt-2 italic">The final chapter with CECI</p>
   
      
//       <div className="flex mb-6 mt-2 justify-center space-x-10">
//         {/* Placeholder for profile pictures */}
//         <div className="flex flex-col items-center">
//           <div className="w-24 h-24 bg-gray-300 rounded-full mb-2 flex items-center justify-center overflow-hidden">
//             {/* <img src="/api/placeholder/200/200" alt="You" className="object-cover" /> */}
//             <Image src={cc} alt="Picture of the author" width={500} height={500} />

//           </div>
//           <p className="font-semibold">Ceci</p>
//         </div>

//         <div className="flex flex-col items-center">
//           <div className="w-24 h-24 bg-gray-300 rounded-full mb-2 flex items-center justify-center overflow-hidden">
//             {/* <img src="/api/placeholder/200/200" alt="CECI" className="object-cover" /> */}
//             <Image src={sufi} alt="Picture of the author" width={500} height={500} />

//           </div>
//           <p className="font-semibold">ME</p>
//         </div>
//       </div>

//       <div className="mb-10">
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart
//             data={data}
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
//             <XAxis  tick={{
//     fontSize: 16,
//     fill: "#4F46E5", // Changed to blue
//     fontWeight: "bold",
//     margin: 10,
//   }}  dataKey="stage" stroke="#6B7280" />
//             <YAxis 
//             className=' text-lg'
//               domain={[0, 100]}
//               ticks={[0, 20, 40, 60, 80, 100]}
//               tick={{
//                 fontSize: 15, // Increased font size
//                 fill: "#F59E0B", // Changed text color to orange
//                 fontWeight: "bold", // Makes it bold for better readability
//               }}
//               stroke="#6B7280"
//               tickFormatter={(value) => {
//                 if (value === 0) return 'Enemies';
//                 if (value === 20) return 'Haters';
//                 if (value === 40) return 'Strangers';
//                 if (value === 60) return 'Friends';
//                 if (value === 80) return 'Close';
//                 if (value === 100) return 'Beyond';
//                 return '';
//               }}
//             />
//             <Tooltip
//               content={({ active, payload }) => {
//                 if (active && payload && payload.length) {
//                   const data = payload[0].payload;
//                   return (
//                     <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
//                       <p className="font-bold text-lg">{data.stage}</p>
//                       <p className=" text-lg flex items-center">
//                         {renderIcon(data.icon)}
//                         <span className="text-lg ml-2">{data.relationship}</span>
//                       </p>
//                     </div>
//                   );
//                 }
//                 return null;
//               }}
//             />
//             <Line 
//               type="monotone" 
//               dataKey="level" 
//               stroke="#8B5CF6" 
//               strokeWidth={3}
//               dot={{ stroke: '#8B5CF6', strokeWidth: 2, r: 6, fill: 'white',  fontSize: 19 }}
//               activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2, fill: '#C4B5FD' }}
//             />
//             <ReferenceLine 
//               y={50} 
//               stroke="#9CA3AF" 
//               strokeDasharray="3 3" 
//               label={{ value: 'Neutral Zone', position: 'right', fill: '#6B7280',  fontSize: 19 }} 
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="bg-gray-800 text-white p-6 rounded-lg shadow-inner flex items-center mb-8">
//         <div className="mr-4">
//           <Shield size={44} className="text-gray-100" />
//         </div>
//         <div>
//           <p className="text-xl font-bold mb-1">"You are the reason I discovered my sigma side..😈😌</p>
//           <p className="text-lg">and it slowly led me to become a well-known Mafia Man...💪🏻✌🏻"</p>
//         </div>
//       </div>

//       <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
//         <p className="text-gray-800 leading-relaxed">
//           This is my last post for CECI, and I have to say our story has been a rollercoaster ride 🎢 with lots of variations... 
//           We first started off as haters ↪️ then became friends ↪️ and at one point, our connection was even stronger than friendship...😌 
//           But then things took a turn ↩️ and we went back 🔙 to being haters for a short while...🙆🏻 ↪️ then constantly switching between being friends, strangers, and haters....🙍🏻 
//           ↪️Unfortunately, in the end, 🔚 you proved to be a disloyal and fake person... 🤥🔴
//         </p>
//       </div>
//     </div>

//       {/* Lion Metaphor */}
//       {/* <div className="bg-amber-50 p-5 rounded-lg shadow-md border border-amber-200 mb-8 flex items-center">
//         <div className="mr-6 text-5xl">🦁</div>
//         <div>
//           <h3 className="font-bold text-amber-800 mb-2">The Lion's Standard</h3>
//           <p className="text-amber-900">
//             "It's like I am a lion and I am waiting for another lion to come along and prove themselves worthy 
//             of being my best friend. Just like how a lion wouldn't eat or friend with grass, 
//             I don't want to settle for someone who isn't on my level."
//           </p>
//         </div>
//       </div> */}

//       {/* Main Announcement */}
//       {/* <div className="bg-indigo-100 p-5 rounded-lg shadow-md mb-8">
//         <h2 className="font-bold text-xl text-indigo-800 mb-3">The Announcement</h2>
//         <p className="text-indigo-900">
//           After spending a lot of time together and going through many challenges, 
//           I am thrilled to announce that <span className="font-bold">Kelma</span> is the person 
//           who deserves the title of my best friend, someone who has consistently shown me 
//           that she's a true and loyal friend.
//         </p>
//       </div> */}
//       {/* <br/>
//       <br/>
//       <br/>
//       <br/> */}

//       {/* Qualities Charts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         {/* Pie Chart */}
//         <div className=" bg-white p-4 rounded-lg shadow-md">
//           <h3 className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-4xl text-center font-extrabold leading-tight   text-gray-800 ">What Makes Kelma Special</h3>
//           <div className="h-80">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={barData}
//           layout="vertical"
//           margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis type="number" domain={[0, 10]} />
//           <YAxis dataKey="name" type="category" width={100} />
//           <Tooltip formatter={(value, name, props) => [`${value}/10 (Weight: ${props.payload.weight})`, name]} />
//           <Bar dataKey="value" fill="#8884d8">
//             {barData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
      
//       {/* <div className="bg-white rounded-lg shadow-md ">
//         <h2 className="text-xl font-semibold mb-3 text-purple-700">Friendship Note</h2>
//         <textarea
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           className="w-full border border-gray-300 rounded p-2 "
//           placeholder="Write a special note about your friendship..."
//         />
//       </div> */}
//     </div>
//           {/* <div className="  h-96 overflow-visible">
//             <ResponsiveContainer width="100%" height="100%" className="overflow-">
//               <PieChart className="overflow-visible">
//                 <Pie
//                   data={categories}
//                   cx="50%"
//                   cy="40%"
//                   labelLine={true}
//                   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={100}
//                   innerRadius={20}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {categories.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
                
//                 <Tooltip formatter={(value) => [`${value} qualities`, 'Count']} />
//                   <br/>
//                   <br/>
//                   <br/>
//                   <br/>
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div> */}
          
//         </div>
//         <div className="text-center mb-8 relative">
//         <div className="absolute left-4 top-0">
//           <div className="w-24 h-24 bg-indigo-200 rounded-full mb-2 flex items-center justify-center overflow-hidden">
//             {/* <img src={jenny} alt="Me" className="object-cover" /> */}
//      <Image src={jenny} alt="Picture of the author" width={500} height={500} />
//           </div>
//         </div>
        
//         <h1 className="text-3xl font-bold text-indigo-900 mb-2">My Best Friend Revealed: Kelma</h1>
//         <p className="text-gray-600 italic">Someone who truly meets my high standards</p>
        
//         <div className="absolute right-4 top-0">
//           <div className="w-24 h-24 bg-indigo-200 rounded-full mb-2 flex items-center justify-center overflow-hidden">
//             {/* <img src={sufi} alt="Kelma" className="object-cover" /> */}
//             <Image src={sufi} alt="Picture of the author" width={500} height={500} />

//           </div>
//         </div>
//       </div>
//         {/* Top Qualities */}
//         <div className="bg-black p-4 rounded-lg shadow-md">
//           <h3 className="hover:text-gray-800 text-center dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-4xl font-extrabold leading-tight text-gray-800 dark:text-white ">Top 10 Qualities of kelma</h3>
//           <div className="overflow-hidden">
//             {topQualities.map((quality, index) => (
//               <div 
//                 key={index}
//                 className="flex items-center mb-2 p-2 rounded-md"
//                 style={{ 
//                   // backgroundColor: `rgba(136, 132, 216, ${0.1 + (index * 0.08)})`,
//                 }}
//               >
//                 <div className="mr-3  text-amber-300 font-bold">{index + 1}.</div>
// <p className=" text-white">
//                   {quality}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Sigma Quote Section */}
//       {/* <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg mb-8 flex items-center">
//         <div className="mr-4 text-4xl">😈</div>
//         <div>
//           <p className="text-xl font-bold mb-1">"You are the reason I discovered my sigma side..😈😌</p>
//           <p className="text-lg">and it slowly led me to become a well-known Mafia Man...💪🏻✌🏻"</p>
//         </div>
//       </div> */}

//       {/* Closing Statement */}
//       {/* <div className="bg-purple-100 p-5 rounded-lg shadow-md text-center">
//         <p className="text-lg text-purple-900 leading-relaxed">
//           "You've brought so much happiness, laughter, courage, and support into my life.
//           You're one of the most special people I've ever met, someone who not only understands my vibe
//           but also stands by my side unconditionally."
//         </p>
//       </div> */}
//       {/* <div className=' ml-3 mr-3 mx-auto'>
//     <div className="flex flex-col p-2 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg  mx-auto">
//        <div className="mb-6 text-center">
//         <h1 className="text-3xl font-bold text-purple-800 mb-2">Friendship Analysis</h1>
//         <div className="flex justify-center gap-8 items-center mt-4">
//           <div className="text-center">
//             <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
//               <span className="text-gray-500">Your<br/>Photo</span>
//             </div>            <input 
//               type="text" 
//               value={yourName}
//               onChange={(e) => setYourName(e.target.value)}
//               className="text-center border border-gray-300 rounded px-2 py-1 text-sm w-full"
//             />
//           </div>
          
//           <div className="text-4xl text-pink-500">❤</div>
          
//           <div className="text-center">
//             <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
//               <span className="text-gray-500">Friend's<br/>Photo</span>
//             </div>
//             <input 
//               type="text" 
//               value={friendName}
//               onChange={(e) => setFriendName(e.target.value)}
//               className="text-center border border-gray-300 rounded px-2 py-1 text-sm w-full"
//             />
//           </div>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//   <div className="bg-white rounded-lg shadow-md p-4">
//     <h2 className="text-xl font-semibold text-center mb-4 text-purple-700">Friendship Factors</h2>
//     <div className="h-80">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={barData}
//           layout="vertical"
//           margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis type="number" domain={[0, 10]} />
//           <YAxis dataKey="name" type="category" width={100} />
//           <Tooltip formatter={(value, name, props) => [`${value}/10 (Weight: ${props.payload.weight})`, name]} />
//           <Bar dataKey="value" fill="#8884d8">
//             {barData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
      
//       <div className="bg-white rounded-lg shadow-md ">
//         <h2 className="text-xl font-semibold mb-3 text-purple-700">Friendship Note</h2>
//         <textarea
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           className="w-full border border-gray-300 rounded p-2 "
//           placeholder="Write a special note about your friendship..."
//         />
//       </div>
//     </div>
    
//     <div className="mt-4  hidden">
//             <h3 className="font-semibold mb-2 text-gray-700">Adjust Factor Scores (1-10):</h3>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <label className="text-sm">Deep Mindset (40%):</label>
//                 <input 
//                   type="number" 
//                   min="1" 
//                   max="10" 
//                   value={deepMindset}
//                   onChange={(e) => setDeepMindset(parseInt(e.target.value) || 0)}
//                   className="border rounded w-16 px-2 py-1"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="text-sm">Complicated Personality (20%):</label>
//                 <input 
//                   type="number" 
//                   min="1" 
//                   max="10" 
//                   value={complicatedPersonality}
//                   onChange={(e) => setComplicatedPersonality(parseInt(e.target.value) || 0)}
//                   className="border rounded w-16 px-2 py-1"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="text-sm">Emotional Attachment (20%):</label>
//                 <input 
//                   type="number" 
//                   min="1" 
//                   max="10" 
//                   value={emotionalAttachment}
//                   onChange={(e) => setEmotionalAttachment(parseInt(e.target.value) || 0)}
//                   className="border rounded w-16 px-2 py-1"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="text-sm">Sweetness & Value (10%):</label>
//                 <input 
//                   type="number" 
//                   min="1" 
//                   max="10" 
//                   value={sweetJokingValue}
//                   onChange={(e) => setSweetJokingValue(parseInt(e.target.value) || 0)}
//                   className="border rounded w-16 px-2 py-1"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="text-sm">Loyalty & Honesty (10%):</label>
//                 <input 
//                   type="number" 
//                   min="1" 
//                   max="10" 
//                   value={loyaltyHonesty}
//                   onChange={(e) => setLoyaltyHonesty(parseInt(e.target.value) || 0)}
//                   className="border rounded w-16 px-2 py-1"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
  
//   <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
//     <h2 className="text-xl font-semibold text-center mb-4 text-purple-700">Overall Friendship Score</h2>
    
//     <div className="flex-1 flex flex-col items-center justify-center">
//       <div className="  h-80 w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             <Pie
//               data={pieData}
//               cx="50%" 
//               cy="50%" 
//               innerRadius={10}  // Changed to create a donut shape
//               outerRadius={90}  // Adjusted for better label visibility
              
//               label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` }
//             >
//               {pieData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Pie>
//             <Tooltip formatter={(value, name, props) => [
//               `${props.payload.actualScore}/10 (Weight: ${props.payload.actualWeight})`,
//               name
//             ]} />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
      
//       <div className="text-center ">
//         <div className="text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
//           {totalScore}%
//         </div>
//         <div className={`text-lg font-semibold ${getScoreColor(totalScore)}`}>
//           {totalScore >= 90 ? 'Extraordinary Bond' : 
//            totalScore >= 75 ? 'Strong Connection' :
//            totalScore >= 60 ? 'Good Friendship' : 'Developing Relationship'}
//         </div>
        
//       </div>
//     </div>
    
//   </div>
  
// </div>

      
//       <div className="bg-white rounded-lg shadow-md p-4">
//         <h2 className="text-xl font-semibold mb-3 text-purple-700">Friendship Note</h2>
//         <textarea
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           className="w-full border border-gray-300 rounded p-2 h-24"
//           placeholder="Write a special note about your friendship..."
//         />
//       </div>
      
//       <div className="mt-6 text-center text-sm text-gray-500">
//         Created with ❤️ | Friendship Analysis | {new Date().toLocaleDateString()}
//       </div>
//     </div>
//     </div> */}
//     </div>
//   );
// };

// export default BestFriendReveal;


// // import React, { useState } from 'react';
// // import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// // const FriendshipAnalysis = () => {
// //   // State for friend's name and photo URL
// //   const [friendName, setFriendName] = useState('Your Friend');
// //   const [yourName, setYourName] = useState('Your Name');
// //   const [note, setNote] = useState('We share a unique bond of understanding and growth.');
  
// //   // Factor scores (out of 10)
// //   const [deepMindset, setDeepMindset] = useState(8);
// //   const [complicatedPersonality, setComplicatedPersonality] = useState(7);
// //   const [emotionalAttachment, setEmotionalAttachment] = useState(9);
// //   const [sweetJokingValue, setSweetJokingValue] = useState(8);
// //   const [loyaltyHonesty, setLoyaltyHonesty] = useState(9);
  
// //   // Factor weights
// //   const factorWeights = {
// //     'Deep Mindset': 0.4,
// //     'Complicated Personality': 0.2,
// //     'Emotional Attachment': 0.2,
// //     'Sweetness & Value': 0.1,
// //     'Loyalty & Honesty': 0.1
// //   };
  
// //   // Calculate the total percentage
// //   const calculateTotal = () => {
// //     const scores = {
// //       'Deep Mindset': deepMindset,
// //       'Complicated Personality': complicatedPersonality,
// //       'Emotional Attachment': emotionalAttachment,
// //       'Sweetness & Value': sweetJokingValue,
// //       'Loyalty & Honesty': loyaltyHonesty
// //     };
    
// //     let total = 0;
// //     for (const factor in scores) {
// //       const normalizedScore = (scores[factor] / 10); // Convert to a 0-1 scale
// //       total += normalizedScore * factorWeights[factor] * 100; // Apply weight and convert to percentage
// //     }
    
// //     return Math.round(total);
// //   };
  
// //   const totalScore = calculateTotal();
  
// //   // Data for the bar chart
// //   const barData = [
// //     { name: 'Deep Mindset', value: deepMindset, fill: '#8884d8', maxValue: 10, weight: '40%' },
// //     { name: 'Complex Personality', value: complicatedPersonality, fill: '#83a6ed', maxValue: 10, weight: '20%' },

// //     { name: 'Emotional Attachment', value: emotionalAttachment, fill: '#8dd1e1', maxValue: 10, weight: '20%' },

// //     { name: 'Sweetness & Value', value: sweetJokingValue, fill: '#82ca9d', maxValue: 10, weight: '10%' },
// //     { name: 'Loyalty & Honesty', value: loyaltyHonesty, fill: '#a4de6c', maxValue: 10, weight: '10%' }
// //   ];
  
// //   // Data for the pie chart
// //   const pieData = barData.map(item => ({
// //     name: item.name,
// //     value: (item.value / 10) * parseFloat(item.weight), // Weighted value
// //     actualWeight: item.weight,
// //     actualScore: item.value
// //   }));
  
// //   const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
  
// //   // Get color based on score
// //   const getScoreColor = (score) => {
// //     if (score >= 90) return 'text-green-600';
// //     if (score >= 75) return 'text-blue-600';
// //     if (score >= 60) return 'text-yellow-600';
// //     return 'text-red-600';
// //   };

// //   return (
// //     <div className=' ml-3 mr-3 mx-auto'>
// //     <div className="flex flex-col p-2 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg  mx-auto">
// //       <div className="mb-6 text-center">
// //         <h1 className="text-3xl font-bold text-purple-800 mb-2">Friendship Analysis</h1>
// //         <div className="flex justify-center gap-8 items-center mt-4">
// //           <div className="text-center">
// //             <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
// //               <span className="text-gray-500">Your<br/>Photo</span>
// //             </div>
// //             <input 
// //               type="text" 
// //               value={yourName}
// //               onChange={(e) => setYourName(e.target.value)}
// //               className="text-center border border-gray-300 rounded px-2 py-1 text-sm w-full"
// //             />
// //           </div>
          
// //           <div className="text-4xl text-pink-500">❤</div>
          
// //           <div className="text-center">
// //             <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
// //               <span className="text-gray-500">Friend's<br/>Photo</span>
// //             </div>
// //             <input 
// //               type="text" 
// //               value={friendName}
// //               onChange={(e) => setFriendName(e.target.value)}
// //               className="text-center border border-gray-300 rounded px-2 py-1 text-sm w-full"
// //             />
// //           </div>
// //         </div>
// //       </div>
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
// //   <div className="bg-white rounded-lg shadow-md p-4">
// //     <h2 className="text-xl font-semibold text-center mb-4 text-purple-700">Friendship Factors</h2>
// //     <div className="h-80">
// //       <ResponsiveContainer width="100%" height="100%">
// //         <BarChart
// //           data={barData}
// //           layout="vertical"
// //           margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
// //         >
// //           <CartesianGrid strokeDasharray="3 3" />
// //           <XAxis type="number" domain={[0, 10]} />
// //           <YAxis dataKey="name" type="category" width={100} />
// //           <Tooltip formatter={(value, name, props) => [`${value}/10 (Weight: ${props.payload.weight})`, name]} />
// //           <Bar dataKey="value" fill="#8884d8">
// //             {barData.map((entry, index) => (
// //               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
// //             ))}
// //           </Bar>
// //         </BarChart>
// //       </ResponsiveContainer>
      
// //       <div className="bg-white rounded-lg shadow-md ">
// //         <h2 className="text-xl font-semibold mb-3 text-purple-700">Friendship Note</h2>
// //         <textarea
// //           value={note}
// //           onChange={(e) => setNote(e.target.value)}
// //           className="w-full border border-gray-300 rounded p-2 "
// //           placeholder="Write a special note about your friendship..."
// //         />
// //       </div>
// //     </div>
    
// //     <div className="mt-4  hidden">
// //             <h3 className="font-semibold mb-2 text-gray-700">Adjust Factor Scores (1-10):</h3>
// //             <div className="space-y-2">
// //               <div className="flex items-center justify-between">
// //                 <label className="text-sm">Deep Mindset (40%):</label>
// //                 <input 
// //                   type="number" 
// //                   min="1" 
// //                   max="10" 
// //                   value={deepMindset}
// //                   onChange={(e) => setDeepMindset(parseInt(e.target.value) || 0)}
// //                   className="border rounded w-16 px-2 py-1"
// //                 />
// //               </div>
// //               <div className="flex items-center justify-between">
// //                 <label className="text-sm">Complicated Personality (20%):</label>
// //                 <input 
// //                   type="number" 
// //                   min="1" 
// //                   max="10" 
// //                   value={complicatedPersonality}
// //                   onChange={(e) => setComplicatedPersonality(parseInt(e.target.value) || 0)}
// //                   className="border rounded w-16 px-2 py-1"
// //                 />
// //               </div>
// //               <div className="flex items-center justify-between">
// //                 <label className="text-sm">Emotional Attachment (20%):</label>
// //                 <input 
// //                   type="number" 
// //                   min="1" 
// //                   max="10" 
// //                   value={emotionalAttachment}
// //                   onChange={(e) => setEmotionalAttachment(parseInt(e.target.value) || 0)}
// //                   className="border rounded w-16 px-2 py-1"
// //                 />
// //               </div>
// //               <div className="flex items-center justify-between">
// //                 <label className="text-sm">Sweetness & Value (10%):</label>
// //                 <input 
// //                   type="number" 
// //                   min="1" 
// //                   max="10" 
// //                   value={sweetJokingValue}
// //                   onChange={(e) => setSweetJokingValue(parseInt(e.target.value) || 0)}
// //                   className="border rounded w-16 px-2 py-1"
// //                 />
// //               </div>
// //               <div className="flex items-center justify-between">
// //                 <label className="text-sm">Loyalty & Honesty (10%):</label>
// //                 <input 
// //                   type="number" 
// //                   min="1" 
// //                   max="10" 
// //                   value={loyaltyHonesty}
// //                   onChange={(e) => setLoyaltyHonesty(parseInt(e.target.value) || 0)}
// //                   className="border rounded w-16 px-2 py-1"
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         </div>
  
// //   <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
// //     <h2 className="text-xl font-semibold text-center mb-4 text-purple-700">Overall Friendship Score</h2>
    
// //     <div className="flex-1 flex flex-col items-center justify-center">
// //       <div className="  h-80 w-full">
// //         <ResponsiveContainer width="100%" height="100%">
// //           <PieChart>
// //             <Pie
// //               data={pieData}
// //               cx="50%" 
// //               cy="50%" 
// //               innerRadius={10}  // Changed to create a donut shape
// //               outerRadius={90}  // Adjusted for better label visibility
              
// //               label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` }
// //             >
// //               {pieData.map((entry, index) => (
// //                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
// //               ))}
// //             </Pie>
// //             <Tooltip formatter={(value, name, props) => [
// //               `${props.payload.actualScore}/10 (Weight: ${props.payload.actualWeight})`,
// //               name
// //             ]} />
// //           </PieChart>
// //         </ResponsiveContainer>
// //       </div>
      
// //       <div className="text-center ">
// //         <div className="text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
// //           {totalScore}%
// //         </div>
// //         <div className={`text-lg font-semibold ${getScoreColor(totalScore)}`}>
// //           {totalScore >= 90 ? 'Extraordinary Bond' : 
// //            totalScore >= 75 ? 'Strong Connection' :
// //            totalScore >= 60 ? 'Good Friendship' : 'Developing Relationship'}
// //         </div>
        
// //       </div>
// //     </div>
    
// //   </div>
  
// // </div>

      
// //       <div className="bg-white rounded-lg shadow-md p-4">
// //         <h2 className="text-xl font-semibold mb-3 text-purple-700">Friendship Note</h2>
// //         <textarea
// //           value={note}
// //           onChange={(e) => setNote(e.target.value)}
// //           className="w-full border border-gray-300 rounded p-2 h-24"
// //           placeholder="Write a special note about your friendship..."
// //         />
// //       </div>
      
// //       <div className="mt-6 text-center text-sm text-gray-500">
// //         Created with ❤️ | Friendship Analysis | {new Date().toLocaleDateString()}
// //       </div>
// //     </div>
// //     </div>
// //   );
// // };

// // export default FriendshipAnalysis;