import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/axios';

const Recommendations = () => {
  const { auth } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerAnalysis, setCareerAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [sortBy, setSortBy] = useState('match'); // match, salary, demand

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/recommendations/${auth.userId}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCareerAnalysis = async (careerId) => {
    setIsAnalysisLoading(true);
    try {
      const response = await api.get(`/api/analysis/${auth.userId}/career/${careerId}`);
      setCareerAnalysis(response.data);
    } catch (error) {
      console.error('Failed to fetch career analysis:', error);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleViewDetails = (career) => {
    setSelectedCareer(career);
    fetchCareerAnalysis(career.careerId);
  };

  const handleCloseModal = () => {
    setSelectedCareer(null);
    setCareerAnalysis(null);
  };

  const getDemandBadge = (level) => {
    const badges = {
      5: { label: 'Very High', color: 'bg-green-100 text-green-700 border-green-200' },
      4: { label: 'High', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      3: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      2: { label: 'Low', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      1: { label: 'Very Low', color: 'bg-red-100 text-red-700 border-red-200' }
    };
    return badges[level] || badges[3];
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 60) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    if (percentage >= 40) return 'Fair Match';
    return 'Needs Development';
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case 'match':
        return b.matchPercentage - a.matchPercentage;
      case 'salary':
        return (b.averageSalary || 0) - (a.averageSalary || 0);
      case 'demand':
        return (b.demandLevel || 0) - (a.demandLevel || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Career Recommendations</h1>
              <p className="text-gray-600 mt-1">Personalized career paths based on your skills</p>
            </div>
          </div>
        </div>

        {/* Sort and Filter */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-800">{recommendations.length}</span> career recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
              >
                <option value="match">Best Match</option>
                <option value="salary">Highest Salary</option>
                <option value="demand">Highest Demand</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
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
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No recommendations available</h3>
            <p className="text-gray-500 mb-4">Add skills to your profile to get personalized career recommendations</p>
            <a
              href="/user/skills"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Skills
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRecommendations.map((career) => {
              const demandBadge = getDemandBadge(career.demandLevel);
              const matchColor = getMatchColor(career.matchPercentage);
              const matchLabel = getMatchLabel(career.matchPercentage);
              
              return (
                <div key={career.careerId} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Career Header */}
                  <div className={`bg-gradient-to-r ${matchColor} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-white flex-1 pr-2">{career.careerName}</h3>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white">{Math.round(career.matchPercentage)}%</div>
                          <div className="text-xs text-white/80">Match</div>
                        </div>
                      </div>
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                        {matchLabel}
                      </span>
                    </div>
                  </div>

                  {/* Career Body */}
                  <div className="p-6">
                    {/* Stats */}
                    <div className="space-y-3 mb-4">
                      {/* Demand Level */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Market Demand
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${demandBadge.color}`}>
                          {demandBadge.label}
                        </span>
                      </div>

                      {/* Average Salary */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Average Salary
                        </span>
                        <span className="font-bold text-gray-800">
                          ${career.averageSalary?.toLocaleString() || '0'}
                        </span>
                      </div>

                      {/* Match Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Skill Match</span>
                          <span className="text-xs font-semibold text-gray-700">{Math.round(career.matchPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${matchColor} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${career.matchPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleViewDetails(career)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      View Skill Gap Analysis
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {selectedCareer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${getMatchColor(selectedCareer.matchPercentage)} px-6 py-5 flex items-center justify-between rounded-t-2xl`}>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedCareer.careerName}</h2>
                <p className="text-white/90 text-sm">Detailed Skill Gap Analysis</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {isAnalysisLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your skill match...</p>
                </div>
              ) : careerAnalysis ? (
                <div className="space-y-6">
                  {/* Overall Match */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Overall Match Score</h3>
                        <p className="text-sm text-gray-600">Based on your current skill set</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-green-600">{Math.round(careerAnalysis.matchPercentage)}%</div>
                        <div className="text-sm text-gray-600">{getMatchLabel(careerAnalysis.matchPercentage)}</div>
                      </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${getMatchColor(careerAnalysis.matchPercentage)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${careerAnalysis.matchPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Required Skills Analysis
                    </h3>

                    <div className="space-y-3">
                      {careerAnalysis.skillGaps && careerAnalysis.skillGaps.length > 0 ? (
                        careerAnalysis.skillGaps.map((gap, index) => (
                          <div 
                            key={index}
                            className={`p-4 rounded-lg border-2 ${
                              gap.matched 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-orange-50 border-orange-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  gap.matched 
                                    ? 'bg-green-600' 
                                    : 'bg-orange-600'
                                }`}>
                                  {gap.matched ? (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800">{gap.skillName}</h4>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-600">
                                      Required: <span className="font-semibold">{gap.requiredLevel}</span>
                                    </span>
                                    {gap.userLevel && (
                                      <span className="text-xs text-gray-600">
                                        Your Level: <span className="font-semibold">{gap.userLevel}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                gap.matched 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-orange-600 text-white'
                              }`}>
                                {gap.matched ? '✓ Qualified' : '⚠ Gap'}
                              </span>
                            </div>
                            
                            {!gap.matched && (
                              <div className="mt-3 pt-3 border-t border-orange-300">
                                <p className="text-sm text-gray-700">
                                  {gap.userLevel 
                                    ? `Improve from ${gap.userLevel} to ${gap.requiredLevel} level`
                                    : `Add this skill at ${gap.requiredLevel} level to your profile`
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No skill requirements available</p>
                      )}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Next Steps
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {careerAnalysis.matchPercentage >= 80 ? (
                        <>
                          <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>You're well-qualified for this role! Consider applying to relevant positions.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Keep your skills updated with the latest industry trends.</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Focus on developing the skills marked with gaps above.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Consider online courses or certifications to bridge the skill gaps.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Gain practical experience through projects or internships.</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Failed to load analysis</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;