import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/axios';

const UserSkill = () => {
  const { auth } = useAuth();
  const [userSkills, setUserSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    id: null,
    skillId: '',
    proficiencyLevel: 'Intermediate',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const categories = ['Backend', 'Programming', 'Design', 'Marketing', 'Business', 'Data Science', 'Other'];

  useEffect(() => {
    fetchUserSkills();
    fetchAvailableSkills();
  }, []);

  const fetchUserSkills = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/user/${auth.userId}/skill`);
      console.log("Fetched user skills:", response.data); // Debug log
      setUserSkills(response.data);
    } catch (error) {
      console.error('Failed to fetch user skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await api.get('/api/skill');
      setAvailableSkills(response.data);
    } catch (error) {
      console.error('Failed to fetch available skills:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.skillId) {
      newErrors.skillId = 'Please select a skill';
    }

    if (!formData.proficiencyLevel) {
      newErrors.proficiencyLevel = 'Please select proficiency level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditMode) {
        await api.put(`/api/user/${auth.userId}/skill`, {
          skillId: formData.skillId,
          proficiencyLevel: formData.proficiencyLevel
        });
        
        setUserSkills(userSkills.map(skill =>
          skill.skillId === formData.skillId 
            ? { ...skill, proficiencyLevel: formData.proficiencyLevel }
            : skill
        ));
        setSuccessMessage('Skill updated successfully!');
      } else {
        const response = await api.post(`/api/user/${auth.userId}/skill`, {
          skillId: formData.skillId,
          proficiencyLevel: formData.proficiencyLevel
        });
        
        // Enrich the response with skill details
        const skillDetails = availableSkills.find(s => s.id === parseInt(formData.skillId));
        const enrichedSkill = {
          ...response.data,
          skillName: skillDetails?.skillName,
          category: skillDetails?.category,
          description: skillDetails?.description
        };
        
        setUserSkills([...userSkills, enrichedSkill]);
        setSuccessMessage('Skill added successfully!');
      }

      handleCloseModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save skill:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save skill. You may already have this skill.' });
    }
  };

  const handleDelete = async (userSkillId) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) return;

    try {
      await api.delete(`/api/user/${auth.userId}/skill/${userSkillId}`);
      setUserSkills(userSkills.filter(skill => skill.id !== userSkillId));
      setSuccessMessage('Skill removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to delete skill:', error);
      alert('Failed to remove skill');
    }
  };

  const handleEdit = (skill) => {
    setFormData({
      id: skill.id,
      skillId: skill.skillId,
      proficiencyLevel: skill.proficiencyLevel,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      id: null,
      skillId: '',
      proficiencyLevel: 'Intermediate',
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      id: null,
      skillId: '',
      proficiencyLevel: 'Intermediate',
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const getSkillDetails = (skillId) => {
    return availableSkills.find(s => s.id === skillId);
  };

  const getProficiencyColor = (level) => {
    const colors = {
      'Beginner': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Intermediate': 'bg-blue-100 text-blue-700 border-blue-200',
      'Advanced': 'bg-purple-100 text-purple-700 border-purple-200',
      'Expert': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[level] || colors['Intermediate'];
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming': 'bg-blue-100 text-blue-700',
      'Backend': 'bg-indigo-100 text-indigo-700',
      'Design': 'bg-purple-100 text-purple-700',
      'Marketing': 'bg-pink-100 text-pink-700',
      'Business': 'bg-green-100 text-green-700',
      'Data Science': 'bg-orange-100 text-orange-700',
      'Other': 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors['Other'];
  };

  const filteredSkills = userSkills.filter(skill => {
    const matchesSearch = skill.skillName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || skill.proficiencyLevel === filterLevel;
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const availableToAdd = availableSkills.filter(skill => 
    !userSkills.some(us => us.skillId === skill.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Skills</h1>
            <p className="text-gray-600 mt-2">Manage and showcase your expertise</p>
          </div>
          <button
            onClick={handleAddNew}
            disabled={availableToAdd.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Skill
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Level Filter */}
            <div className="relative">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">All Proficiency Levels</option>
                {proficiencyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {userSkills.length === 0 ? 'No skills added yet' : 'No skills match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {userSkills.length === 0 
                ? 'Start building your profile by adding your skills'
                : 'Try adjusting your search or filters'
              }
            </p>
            {userSkills.length === 0 && availableToAdd.length > 0 && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Skill
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Skill Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {skill.skillName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{skill.skillName}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getCategoryColor(skill.category)} bg-white`}>
                        {skill.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skill Body */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{skill.description || 'No description available'}</p>

                  {/* Proficiency Level */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Proficiency Level</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getProficiencyColor(skill.proficiencyLevel)}`}>
                      {skill.proficiencyLevel}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Skills</p>
                <p className="text-2xl font-bold text-gray-800">{userSkills.length}</p>
              </div>
            </div>
          </div>

          {proficiencyLevels.slice(1).map((level) => {
            const count = userSkills.filter(s => s.proficiencyLevel === level).length;
            const colorMap = {
              'Intermediate': 'bg-blue-100 text-blue-600',
              'Advanced': 'bg-purple-100 text-purple-600',
              'Expert': 'bg-green-100 text-green-600'
            };
            return (
              <div key={level} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${colorMap[level]} rounded-lg flex items-center justify-center`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{level}</p>
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? 'Update Skill Proficiency' : 'Add New Skill'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {errors.submit && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="space-y-5">
                {/* Skill Selection */}
                <div>
                  <label htmlFor="skillId" className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Skill *
                  </label>
                  <select
                    id="skillId"
                    name="skillId"
                    value={formData.skillId}
                    onChange={handleInputChange}
                    disabled={isEditMode}
                    className={`w-full px-4 py-3 border ${errors.skillId ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Choose a skill to add</option>
                    {(isEditMode ? availableSkills : availableToAdd).map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.skillName} ({skill.category})
                      </option>
                    ))}
                  </select>
                  {errors.skillId && (
                    <p className="mt-1 text-sm text-red-600">{errors.skillId}</p>
                  )}
                  {isEditMode && (
                    <p className="mt-1 text-xs text-gray-500">Skill cannot be changed in edit mode</p>
                  )}
                </div>

                {/* Proficiency Level */}
                <div>
                  <label htmlFor="proficiencyLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                    Proficiency Level *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {proficiencyLevels.map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, proficiencyLevel: level })}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          formData.proficiencyLevel === level
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  {errors.proficiencyLevel && (
                    <p className="mt-1 text-sm text-red-600">{errors.proficiencyLevel}</p>
                  )}
                </div>

                {/* Proficiency Description */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Proficiency Guide:</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li><span className="font-semibold">Beginner:</span> Basic understanding, limited practical experience</li>
                    <li><span className="font-semibold">Intermediate:</span> Good working knowledge, can work independently</li>
                    <li><span className="font-semibold">Advanced:</span> Deep expertise, can mentor others</li>
                    <li><span className="font-semibold">Expert:</span> Industry-recognized authority, innovative contributions</li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  {isEditMode ? 'Update Proficiency' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSkill;