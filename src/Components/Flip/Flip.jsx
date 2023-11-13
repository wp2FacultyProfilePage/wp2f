import React, { useState, useEffect } from 'react';
import FlipPage from 'react-pageflip';
import { txtDB } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Import 'query' and 'where' from firebase/firestore
import './flip.css';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCertificate, faBook } from '@fortawesome/free-solid-svg-icons';


const IconContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Flipbook = () => {
  const [users, setUsers] = useState([]);
  const [showCertifications, setShowCertifications] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [showResearch, setShowResearch] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('year');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortButtons, setShowSortButtons] = useState(false); // Corrected variable name

  // Define your getFlipbookData function
  const getFlipbookData = async () => {
    const valRef = collection(txtDB, 'faculty');
    const querySnapshot = await getDocs(query(valRef, where('archived', '==', false)));

    const flipbookData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUsers(flipbookData); // Set the users state with the filtered data
  };
	
  // Call the getFlipbookData function when the component mounts
  useEffect(() => {
    const getFlipbookData = async () => {
      const valRef = collection(txtDB, 'faculty');
      const querySnapshot = await getDocs(query(valRef, where('archived', '==', false)));
      const flipbookData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      const usersWithResearch = await Promise.all(
        flipbookData.map(async (user) => {
          const researchData = await getResearchData(user.id);
          user.research = researchData;
          return user;
        })
      );
  
      setUsers(usersWithResearch);
    };
  
    getFlipbookData();
  }, []);
  

  const getResearchData = async (facultyId) => {
    const researchCollectionRef = collection(txtDB, 'faculty', facultyId, 'researches');
    const querySnapshot = await getDocs(researchCollectionRef);
    const researchData = [];

    querySnapshot.forEach((doc) => {
      researchData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return researchData;
  };

   const toggleCertifications = () => {
    setShowCertifications(true);
    setShowProfile(false);
    setShowResearch(false);
  };

  const toggleProfile = () => {
    setShowProfile(true);
    setShowCertifications(false);
    setShowResearch(false);
  };

  const toggleResearch = () => {
    setShowResearch(true);
    setShowCertifications(false);
    setShowProfile(false);
  };

  const toggleSortButtons = () => {
    setShowSortButtons(!showSortButtons);
  };

  const handleResearchSort = (criteria) => {
    // Toggle sorting order if the same criteria is selected
    if (criteria === sortCriteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortOrder('asc');
    }
  };


  return (
    <div id="main-container">
      <div className="flipbook-container" >
     <FlipPage width={300} height={508}>
       {users.map((user, index) => {
         // Add a conditional check to ensure user.research is defined
         const researchData = user.research || [];
         
         const sortedResearch = researchData.slice(0); // Create a copy of the research array

         sortedResearch.sort((a, b) => {
           const order = sortOrder === 'asc' ? 1 : -1;

           if (sortCriteria === 'year') {
             return order * (a.year - b.year);
           } else if (sortCriteria === 'title') {
             return order * a.title.localeCompare(b.title);
           }

           return 0;
         });

         return (
           <div className={`page ${index % 2 === 0 ? 'even-page' : 'odd-page'}`} key={index}>
             <div id="flip-main-container">
               <p id="facultyType">{user.facultyType}</p>
               <img id="imgicon" src={user.imgUrl}/>
               <div>
                 <p id="name">{user.name}</p>
                 <hr id="hr1"></hr>
                 <p id="pos">{user.position}</p>
                 {showProfile && (
                   <div>
                     <p id="dep">
                       <label>DEPARTMENT</label>
                       <br />
                       {user.department}
                     </p>
                     <p id="emp">
                       <label>EMPLOYMENT</label>
                       <br />
                       {user.employment}
                     </p>
                     <div>
                       <p id="edu">
                         <label>EDUCATION</label>
                       </p>
                       <ul id="ul-edu">
                         {user.education.map((item, eduIndex) => (
                           <li id="li-edu" key={eduIndex}>{item}</li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 )}
                 {showCertifications && (
                   <div>
                     <p id="label">CERTIFICATIONS</p>
                     <div id="cert">
                       <ul id="ul-cert" >
                         {user.certifications.map((certification, certIndex) => (
                           <li id="li-cert" key={certIndex}>{certification}</li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 )}
                 {showResearch && (
                   <div>
                     <p id="res">RESEARCH</p>
                     <ul id="ul-research">
                       {sortedResearch.map((research, resIndex) => (
                         <li id="li-research" key={resIndex}>
                           <p id="label1">
                             <span id="title">Title: </span>
                             <a id="research-label" href={research.link} target="_blank" rel="noopener noreferrer">
                               {research.title}
                             </a>
                           </p>
                           <p id="label1">
                             <span id="author">Author: </span>
                             {research.author && Array.isArray(research.author) ? research.author.join(', ') : ''}
                           </p>
                           <p id="label1">
                             <span id="year">Year: </span>
                             {research.year}
                           </p>
                           <hr id="hr2"></hr>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

               </div>
             </div>
           </div>
         );
       })}
     </FlipPage>
       <IconContainer>
         <div id="nav-container">
           <button id="facultyProfileButton" onClick={toggleProfile}>
             <FontAwesomeIcon id="icon" icon={faUser} />Profile
           </button>
           <button id="certificationsButton" onClick={toggleCertifications}>
             <FontAwesomeIcon id="icon" icon={faCertificate} />Certifications
           </button>
           <button id="researchButton" onClick={() => { toggleResearch(); toggleSortButtons(); }}>
             <FontAwesomeIcon id="icon" icon={faBook} /> Research
           </button>
           {showSortButtons && showResearch && ( // Conditionally render sort buttons
             <div>
               <button id="yearsort" onClick={() => handleResearchSort('year')}>
                 {sortCriteria === 'year' && sortOrder === 'asc' && '▲'} 
                 {sortCriteria === 'year' && sortOrder === 'desc' && '▼'}
                 Sort by Year
               </button>
               <button id="titlesort" onClick={() => handleResearchSort('title')}>
                 {sortCriteria === 'title' && sortOrder === 'asc' && '▲'}
                 {sortCriteria === 'title' && sortOrder === 'desc' && '▼'}
                 Sort by Title 
               </button>
             </div>
           )}
         </div>
       </IconContainer>
   </div>
    </div>
    
  );
};

export default Flipbook;
