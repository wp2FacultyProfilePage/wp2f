import React, { useEffect, useState, useRef } from "react";
import { imgDB, txtDB } from "../../firebase";
import { v4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Swal from 'sweetalert2';
import cictlogo from './cictlogo.png';
import defaultImage from './default.jpg';
import './Add.css';

function CRUD() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [employment, setEmployment] = useState('');
  const [img, setImg] = useState();
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(0);
  const [link, setLink] = useState('');
  const [/* research */, setResearch] = useState('');
  const [selectedResearch, setSelectedResearch] = useState('');
  const [editedData, setEditedData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [addResearchModalOpen, setAddResearchModalOpen] = useState(false);
  // const [EditResearchModalOpen, setEditResearchModalOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [researchData, setResearchData] = useState([]); // Initialize researchData state variable
  const [selectedFacultyType, setSelectedFacultyType] = useState('BSIT CORE FACULTY');
  const [uploadedImageURL, setUploadedImageURL] = useState(defaultImage);
  const fileInputRef = useRef(null);
  

  // State for dynamic Author, Certification and Education input fields
  const [certificationsFields, setCertificationsFields] = useState(['']);
  const [educationFields, setEducationFields] = useState(['']);
  const [author, setAuthor] = useState(['']);
  
    // Function to handle changes in Author input fields
  const handleAuthorChange = (e, index) => {
    const updatedAuthors = [...author];
    updatedAuthors[index] = e.target.value;
    setAuthor(updatedAuthors);
  };

  // Function to add a new Author field
  const addAuthorField = () => {
    setAuthor([...author, '']);
  };

  // Function to remove an Author field by index
  const removeAuthorField = (index) => {
    if (author.length > 1) {
      const newAuthors = [...author];
      newAuthors.splice(index, 1);
      setAuthor(newAuthors);
    }
  };

 // Function to add a new Education field
  const addEducationField = () => {
    // Check if educationFields is an array before updating it
    if (Array.isArray(educationFields)) {
      setEducationFields([...educationFields, '']);
    }
  };

   // Function to handle changes in Education input fields
   const handleEducationChange = (e, index) => {
    // Check if educationFields is an array before updating it
    if (Array.isArray(educationFields)) {
      const updatedEducation = [...educationFields];
      updatedEducation[index] = e.target.value;
      setEducationFields(updatedEducation);
    }
  };


  // Function to remove the last Education field
  const removeEducationField = () => {
    // Check if educationFields is an array before updating it
    if (Array.isArray(educationFields) && educationFields.length > 1) {
      const newFields = [...educationFields];
      newFields.pop();
      setEducationFields(newFields);
    }
  };

  // Function to add a new Certification field
  const handleCertificationsChange = (e, index) => {
    // Check if certificationsFields is an array before updating it
    if (Array.isArray(certificationsFields)) {
      const updatedCertifications = [...certificationsFields];
      updatedCertifications[index] = e.target.value;
      setCertificationsFields(updatedCertifications);
    }
  };

  // Function to add a new Certification field
  const addCertificationField = () => {
    // Check if certificationsFields is an array before updating it
    if (Array.isArray(certificationsFields)) {
      setCertificationsFields([...certificationsFields, '']);
    }
  };

  // Function to remove the last Certification field
  const removeCertificationField = () => {
    // Check if certificationsFields is an array before updating it
    if (Array.isArray(certificationsFields) && certificationsFields.length > 1) {
      const newFields = [...certificationsFields];
      newFields.pop();
      setCertificationsFields(newFields);
    }
  };

  const handleAddResearch = () => {
    if (selectedItem) {
      const facultyMemberId = selectedItem.id;
      const researchCollectionRef = collection(txtDB, 'faculty', facultyMemberId, 'researches');
      const newResearchItem = {
        title: title,
        author: author.filter(author => author.trim() !== ''), // Filter out empty author fields
        year: year,
        link: link,
      };
  
      addDoc(researchCollectionRef, newResearchItem)
        .then(() => {
          setTitle('');
          setAuthor(['']); // Reset authors to one empty field
          setYear(0);
          setLink('');
          closeAddResearchModal();
        })
        .catch((error) => {
          console.error('Error adding research item: ', error);
        });
    }
  };
   
  const handleDeleteResearch = (research) => {
    // You need to implement the logic to delete the research data from Firebase here.
    // Here's an example using Firebase's deleteDoc function:
    const facultyMemberId = selectedItem.id; // Assuming you have the faculty member's ID
    const researchId = research.id; // Assuming you have the research document ID
  
    const researchCollectionRef = collection(txtDB, 'faculty', facultyMemberId, 'researches');
    const researchDocRef = doc(researchCollectionRef, researchId);
  
    // Use the deleteDoc function to delete the research document
    deleteDoc(researchDocRef)
      .then(() => {
        // Handle success (you can also update the UI accordingly)
        console.log('Research deleted successfully.');
      })
      .catch((error) => {
        // Handle errors
        console.error('Error deleting research:', error);
      });
  };

  const openAddResearchModal = (research) => {
    setSelectedResearch(research);
    setAddResearchModalOpen(true);
  };

  const closeAddResearchModal = () => {
    setAddResearchModalOpen(false);
  };

  const openResearchModal = (research) => {
    setSelectedResearch(research);
    setResearchModalOpen(true);
  };

  const closeResearchModal = () => {
    setResearchModalOpen(false);
  };

  // const openEditResearchModal = async (research) => {
  //   setSelectedResearch(research);
  
  //   if (selectedItem) {
  //     const facultyId = selectedItem.id;
  //     const researchData = await getResearchData(facultyId);
  
  //     // Now you have the research data and can display it in your modal
  //     // Set the state to populate the modal fields with the existing data
  //     setTitle(research.title);
  //     setAuthor(research.author);
  //     setYear(research.year);
  //     setLink(research.link);
  //   }
  
  //   setEditResearchModalOpen(true);
  // };

  // const closeEditResearchModal = () => {
  //   setEditResearchModalOpen(false);
  // };

  const openItemModal = (value) => {
    setSelectedItem(value);
  };

  const closeItemModal = (value) => {
    setSelectedItem(value);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setIsModalOpen(false);
    setUploadedImageURL(defaultImage); // Clear the uploaded image URL
    setEducationFields(['']); // Reset educationFields with an empty array
    setCertificationsFields(['']); // Reset certificationsFields with an empty array

  };

  const openEditModal = (value) => {
    setEditedData(value);
    // Set the state with the data of the item to be edited
    setName(value.name || '');
    setPosition(value.position || '');
    setDepartment(value.department || '');
    setEmployment(value.employment || '');
    setEducationFields(value.education || ['']); // Set educationFields with fetched data or an empty array
    setCertificationsFields(value.certifications || ['']); // Set certificationsFields with fetched data or an empty array
    setTitle(value.title || ''); // Populate "Title" with the selected data
    setAuthor(value.author || ['']); // Populate "Author" with the selected data
    setYear(value.year || 0); // Populate "Year" with the selected data
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setUploadedImageURL(defaultImage); // Clear the uploaded image URL
  };

  const clearInputs = () => {
    setName('');
    setPosition('');
    setDepartment('');
    setEmployment('');
    setEducationFields(['']); // Set it as an empty array
    setCertificationsFields(['']);// Set it as an empty array
    setResearch('');
  };

  const handleUpload = (e) => {
    const imgs = ref(imgDB, `Imgs/${v4()}`);
      uploadBytes(imgs, e.target.files[0]).then(data => {
        getDownloadURL(data.ref).then(val => {
          setImg(val);
          setUploadedImageURL(val); // Set the uploaded image URL here
      });
    })
    .catch((error) => {
      console.error('Error uploading image: ', error);
    });
  };

  const handleClick = async () => {
    {
      if (!name ||  !department || !employment || !educationFields || !certificationsFields ||  !img) {
        // Check if any of the required fields is empty
        Swal.fire({
          title: 'Error',
          text: 'Please fill in all fields before adding data.',
          icon: 'error',
        });
      }
      else{
        const valRef = collection(txtDB, 'faculty');
        const certificationsArray = certificationsFields.filter(certification => certification !== '');
        const educationArray = educationFields.filter(education => education !== '');
        const facultyDocRef = await addDoc(valRef, {
          name: name,
          position: position,
          department: department,
          employment: employment,
          education: educationArray,
          certifications: certificationsArray,
          facultyType: selectedFacultyType,
          archived:false,
          imgUrl: img
        });
         // Add research data to the "Research" subcollection
         const facultyId = facultyDocRef.id;
        Swal.fire({
          title: 'Data Added',
          text: 'Data added successfully!',
          icon: 'success',
        });
        clearInputs();
      }
      }
      
  };

  const updateUser = async (id) => {

    if (!img) {
      // Check if any of the required fields is empty
      Swal.fire({
        title: 'Error',
        text: 'Please fill in all fields before adding data.',
        icon: 'error',
      });
    }
    if (!editedData) return;
    const userDoc = doc(txtDB, 'faculty', id);
    const newInfo = {
      name: name,
      position: position,
      department: department,
      employment: employment,
      education: educationFields,
      certifications: certificationsFields,
      facultyType: selectedFacultyType,
      imgUrl: img
    };

    await updateDoc(userDoc, newInfo);
    clearInputs();
    setIsEditModalOpen(false);
    setDataLoaded(false);
  };

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
  
  const getData = async () => {
    const valRef = collection(txtDB, 'faculty');
    const dataDb = await getDocs(valRef);
    const allData = dataDb.docs.map(val => ({ ...val.data(), id: val.id }));
    setData(allData);
    setDataLoaded(true);
  };

  // const deleteUser = async (id) => {
  //   const userDoc = doc(txtDB, 'faculty', id);
  //   await deleteDoc(userDoc);
  //   clearInputs();
  //   setDataLoaded(false);
  // };

  const archiveUser = async (id, archived) => {
    const userDocRef = doc(txtDB, 'faculty', id);
    const updateData = {
      archived,
    };
  
    try {
      await updateDoc(userDocRef, updateData);
      Swal.fire({
        title: archived ? 'Archived' : 'Unarchived',
        text: `Data has been ${archived ? 'archived' : 'unarchived'} successfully!`,
        icon: 'success',
      });
    } catch (error) {
      console.error(`Error ${archived ? 'archiving' : 'unarchiving'} data:`, error);
    }
  };
  

  useEffect(() => {
    if (!dataLoaded) {
      getData();
    }
    if (researchModalOpen && selectedItem !== null) {
      const facultyMemberId = selectedItem.id;
      getResearchData(facultyMemberId)
        .then((researchData) => {
          setResearchData(researchData);
        })
        .catch((error) => {
          console.error('Error fetching research data: ', error);
        });
    }
  }, [dataLoaded,researchModalOpen, selectedItem]);

  

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to log out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userToken');
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
        }).then(() => {
          window.location.replace('/login');
        });
      }
    });
  };
  const handleLogoutView = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to switch to Flipbook Page.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Move to Flipbook Page',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userToken');
        Swal.fire({
          title: 'Redirecting......',
        }).then(() => {
          window.location.href = '/';
        });
      }
    });
  };
  

  return (
    <div className="custom-container">
      <div className="custom-sidebar">
        <img src={cictlogo} alt="Sidebar Image" id="CustomAdminicon_sidebar" />
        <div className="custom-sidebar-text">
          <h2>CICT FACULTY <br />(ADMIN)</h2>
        </div>
        <div className="custom-button-container">
            <div>
              <button id="viewflipbtn" onClick={handleLogoutView}>
               VIEW FLIPBOOK
              </button>
            </div>

            <div>
              <button id="logoutbtn" onClick={handleLogout}>
                LOG OUT
              </button>
            </div>
        </div>
      </div>

      <div className="custom-main-content">
        <div id="addfaculty">
          <button id="addfacultybtn" onClick={openModal}>
            ADD FACULTY
          </button>
        </div>

        <div className="scrollable-grid-container">
          <div className="grid-container">
            {data.map((value) => (
              <div className={`div-icon ${value.archived ? 'archived' : ''}`} key={value.id} onClick={() => openItemModal(value)}>
                <img src={value.imgUrl} height="300px" width="300px" />
                <h1>{value.name}</h1>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedItem && (
        <div id="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <table>
                <tbody>
                  <tr>
                    <th id="title"> 
                    <p className="modal-title">
                    PROFILE
                      <span className="thclose" onClick={() => openItemModal(null)}>
                        &times;
                        
                      </span>
                   
                    </p>
                    </th>
                  </tr>
                  <tr>
                    <td>
                    <div className="modal-details">
                      <img src={selectedItem.imgUrl} alt="Selected Image" />
                      <p><strong>{selectedItem.facultyType}</strong></p>
                      <p><strong>Name:</strong> {selectedItem.name}</p>
                      <p><strong>Position:</strong> {selectedItem.position}</p>
                      <p><strong>Department:</strong> {selectedItem.department}</p>
                      <p><strong>Employment Status:</strong> {selectedItem.employment}</p>
                      <p><strong>Educational Attainment:</strong></p>
                      <ul id="ul-add">
                        {Array.isArray(selectedItem.education) ? (
                          selectedItem.education.map((education, index) => (
                            <li id="li-add" key={index}>{education}</li>
                          ))
                        ) : (
                          <li>No education data</li>
                        )}
                      </ul>
                      <p><strong>Certifications:</strong></p>
                      <ul id="ul-adds" className="cert-scroll">
                        {Array.isArray(selectedItem.certifications) ? (
                          selectedItem.certifications.map((certification, index) => (
                            <li id="li-add" key={index}>{certification}</li>
                          ))
                        ) : (
                          <li id="li-add">No certification data</li>
                        )}
                      </ul>
                    </div>
                    <button id="viewbtn" onClick={() => openResearchModal(selectedItem.research)}>
                      VIEW RESEARCH
                    </button>
                    <button id="editbtn" onClick={() => openEditModal(selectedItem)}>
                      EDIT
                    </button>
                    <button id="archiveButton" onClick={() => {archiveUser(selectedItem.id, !selectedItem.archived);closeItemModal();
                      }}>
                      {selectedItem.archived ? 'UNARCHIVE' : 'ARCHIVE'}
                    </button>


                    </td>
                  </tr>
                </tbody>
              </table>   
            </div>
          </div>
         
        </div>
      )}

      {isModalOpen && (
          <div className="add-modal-overlay">
            <div className="add-modal">
              <div className="custom-modal">
              {uploadedImageURL && (
                <img id="img-show" src={uploadedImageURL} alt="Uploaded Image" style={{maxWidth: '150px', maxHeight: '150px' }} />
              )}
              <input id="Input" type="file" onChange={(e) => handleUpload(e)} ref={fileInputRef} />
                <label>Faculty Type:</label>
                  <select value={selectedFacultyType} onChange={(e) => setSelectedFacultyType(e.target.value)}>
                    <option value="BSIT CORE FACULTY">BSIT CORE FACULTY</option>
                    <option value="ALLIED CORE FACULTY">ALLIED CORE FACULTY</option>
                    <option value="BSIS CORE FACULTY">BSIS CORE FACULTY</option>
                    <option value="BLIS CORE FACULTY">BLIS CORE FACULTY</option>
                    <option value="PART-TIME FACULTY">PART-TIME FACULTY</option>
                    <option value="INDUSTRY PRACTITIONERS">INDUSTRY PRACTITIONERS</option>
                  </select>
                <input id="Input" placeholder="Name...." onChange={(e) => setName(e.target.value)}/>
                <input id="Input" placeholder="Position...." onChange={(e) => setPosition(e.target.value)}/>
                <input id="Input" placeholder="Department...." onChange={(e) => setDepartment(e.target.value)}/>
                <input id="Input" placeholder="Employment Status....." onChange={(e) => setEmployment(e.target.value)}/>
                <div style={{ maxHeight: '200px', overflow: 'scroll' }}>
                {educationFields.map((value, index) => (
                  <div key={index}>
                    <input id="input-div" placeholder={`Educational Attainment #${index + 1}....`} onChange={(e) => handleEducationChange(e, index)} value={value} />
                    <button id="addbutton" onClick={addEducationField}>+</button>
                    <button id="minusbutton" onClick={() => removeEducationField(index)}>-</button>
                  </div>
                ))}
                {certificationsFields.map((value, index) => (
                  <div key={index}>
                    <input id="input-div" placeholder={`Certification #${index + 1}....`} onChange={(e) => handleCertificationsChange(e, index)} value={value} />
                    <button id="addbutton" onClick={addCertificationField}>+</button>
                    <button id="minusbutton" onClick={() => removeCertificationField(index)}>-</button>
                  </div>
                ))}

                  </div>    
                <div id="type">
                  
                </div>
                <div id="btn-container">
                  <button id="addbtn" onClick={() => { handleClick();}}>
                    ADD
                  </button>
                  <button id="closebtn" onClick={() => { closeModal(); }}>
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}

      {isEditModalOpen && editedData && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="custom-modal">
              <table id="edit-table">
                <tbody>
                  <tr>
                    <th id="title"> 
                      <p className="modal-title">EDIT</p>
                    </th>
                  </tr>
                  <tr>
                    <td>
                      {uploadedImageURL && (
                        <img id="img-show" src={uploadedImageURL} alt="Uploaded Image" style={{maxWidth: '150px', maxHeight: '150px' }} />
                      )}
                      <input id="input-edit" type="file" onChange={(e) => handleUpload(e)} ref={fileInputRef} />
                      <input id="input-edit" placeholder="Name...." onChange={(e) => setName(e.target.value)} value={name} />
                      <input id="input-edit" placeholder="Position...." onChange={(e) => setPosition(e.target.value)} value={position} />
                      <input id="input-edit" placeholder="Department...." onChange={(e) => setDepartment(e.target.value)} value={department} />
                      <input id="input-edit" placeholder="Employment Status....." onChange={(e) => setEmployment(e.target.value)} value={employment} />
                      <div id="scrollable-list">
                      {educationFields.map((value, index) => (
                        <div key={index}>
                            <input id="input-div" 
                            placeholder={`Educational Attainment #${index + 1}....`}
                            onChange={(e) => handleEducationChange(e, index)}
                            value={value}
                            />
                            <button id="addbutton" onClick={addEducationField}>+</button>
                            <button id="minusbutton" onClick={() => removeEducationField(index)}>-</button>
                        </div>
                        ))}
                        {certificationsFields.map((value, index) => (
                        <div  key={index}>
                            <input  id="input-div"
                            placeholder={`Certification #${index + 1}....`}
                            onChange={(e) => handleCertificationsChange(e, index)}
                            value={value}
                            />
                            <button id="addbutton" onClick={addCertificationField}>+</button>
                            <button id="minusbutton" onClick={() => removeCertificationField(index)}>-</button>
                        </div>
                        ))}
                      </div> 
                    </td>
                  </tr>
                </tbody>
              </table>
              <div>
                <label>Faculty Type:</label>
                <select value={selectedFacultyType} onChange={(e) => setSelectedFacultyType(e.target.value)}>
                  <option value="BSIT CORE FACULTY">BSIT CORE FACULTY</option>
                  <option value="ALLIED CORE FACULTY">ALLIED CORE FACULTY</option>
                  <option value="BSIS CORE FACULTY">BSIS CORE FACULTY</option>
                  <option value="BLIS CORE FACULTY">BLIS CORE FACULTY</option>
                  <option value="PART-TIME FACULTY">PART-TIME FACULTY</option>
                  <option value="INDUSTRY PRACTITIONERS">INDUSTRY PRACTITIONERS</option>
                </select>
              </div>
              <div id="btn-container">
              <button id="confirmbtn" onClick={() => updateUser(editedData.id)}>
                Confirm
              </button>
              <button id="closebtn" onClick={closeEditModal}>
                Close
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {researchModalOpen && selectedResearch !== null && (
        <div className="research-modal-overlay">
          <div className={`research-modal ${researchModalOpen ? 'open' : ''}`}>
            <div className="research-modal-content">
              <div className="scrollable-table">
                <table id="research-table">
                  <tbody>
                    <tr>
                      <th id="title">
                        <p className="modal-title">
                          <span className="thclose" onClick={() => closeResearchModal()}>
                            &times;
                          </span>
                          RESEARCH
                        </p>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        <div className="modal-details">
                          <button id="addresearch-button" onClick={openAddResearchModal}>
                            ADD RESEARCH
                          </button>
                          <div id="research-list" className="table-wrapper">
                            <table className="research-table">
                              <thead>
                                <tr>
                                  <th>TITLE</th>
                                  <th>AUTHOR</th>
                                  <th>YEAR</th>
                                  <th>ACTIONS</th> {/* Add a new column for buttons */}
                                </tr>
                              </thead>
                              <tbody>
                                {researchData.map((research) => (
                                  <tr key={research.id} className="research-item">
                                    <td> 
                                      <a id="research-label"  href={research.link} target="_blank" rel="noopener noreferrer">
                                        {research.title}
                                      </a>
                                    </td>
                                    <td>{research.author ? research.author.join(', ') : ''}</td>
                                    <td>{research.year}</td>
                                    <td>
                                      {/* <button id="editresearch-button" onClick={openEditResearchModal}>
                                      Edit
                                      </button> */}
                                      <button id="researchdeletebtn" onClick={() => handleDeleteResearch(research)}>
                                        REMOVE
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {addResearchModalOpen && (
        <div className="add-modal-overlay">
          <div className="add-modal">
            <div className="research-add-modal-content">
              <table>
                 <tbody>
                 <tr>
                    <th>
                    <p className="modal-title">
                    <span className="thclose" onClick={closeAddResearchModal}>
                      &times;
                    </span>
                    ADD RESEARCH
                    </p>
                    </th>
                  </tr>
                  <tr>
                    <td>
                    <div className="modal-details">
                        <input id="input-research"
                          placeholder="Title...."
                          onChange={(e) => setTitle(e.target.value)}
                        /><br />
                        <div id="btn-container">
                          <label>Authors:</label>
                          <div id="scrollable-list">
                            {author.map((value, index) => (
                              <div key={index} id="btn-container">
                                <input  id="research-div"
                                  placeholder={`Author #${index + 1}....`}
                                  value={value}
                                  onChange={(e) => handleAuthorChange(e, index)}
                                />
                                {index === author.length - 1 && ( // Display "+" button for the last author field
                                  <button id="add-author" onClick={addAuthorField}>+</button>
                                )}
                                {index !== 0 && ( // Display "-" button for all but the first author field
                                  <button id="minus-author" onClick={() => removeAuthorField(index)}>-</button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <input id="input-research"
                          placeholder="Year...."
                          onChange={(e) => setYear(e.target.value)}
                        /><br />
                        <input id="input-research"
                          placeholder="Link...."
                          onChange={(e) => setLink(e.target.value)}
                        /><br />
                        
                      </div>
                    </td>
                  </tr>
                  <div id="btn-container">
                    <button id="addbtn" onClick={handleAddResearch}>
                        Add
                    </button>
                  </div>
                 </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    
    </div>
);
}

export default CRUD;
