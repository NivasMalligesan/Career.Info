import React, { useState, useRef, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";

/* ─── Helpers ─── */
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

function levelValue(l) {
  return LEVELS.indexOf(l) + 1 || 0;
}

function matchColor(pct) {
  if (pct >= 80) return { bar: "from-emerald-500 to-green-400", badge: "bg-emerald-100 text-emerald-800", ring: "ring-emerald-300" };
  if (pct >= 60) return { bar: "from-blue-500 to-cyan-400", badge: "bg-blue-100 text-blue-800", ring: "ring-blue-300" };
  if (pct >= 40) return { bar: "from-amber-500 to-yellow-400", badge: "bg-amber-100 text-amber-800", ring: "ring-amber-300" };
  return { bar: "from-rose-500 to-red-400", badge: "bg-rose-100 text-rose-800", ring: "ring-rose-300" };
}

function matchLabel(pct) {
  if (pct >= 80) return "Excellent Match";
  if (pct >= 60) return "Good Match";
  if (pct >= 40) return "Partial Match";
  return "Needs Work";
}

/* ─── Step Indicator ─── */
function Steps({ current }) {
  const steps = ["Upload Resume", "Review Skills", "Career Analysis"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${done ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                  : active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-100"
                  : "bg-gray-100 text-gray-400"}`}
              >
                {done ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : idx}
              </div>
              <span className={`mt-2 text-xs font-semibold whitespace-nowrap ${active ? "text-indigo-700" : done ? "text-emerald-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 mx-1 mb-4 transition-all duration-500 ${done ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Skill Chip (editable) ─── */
function SkillChip({ skill, onLevelChange, onRemove }) {
  const colors = {
    Beginner: "bg-yellow-50 border-yellow-200 text-yellow-800",
    Intermediate: "bg-blue-50 border-blue-200 text-blue-800",
    Advanced: "bg-purple-50 border-purple-200 text-purple-800",
    Expert: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium ${colors[skill.proficiencyLevel] || colors.Intermediate}`}>
      <span className="truncate max-w-[130px]">{skill.skillName}</span>
      <select
        value={skill.proficiencyLevel}
        onChange={(e) => onLevelChange(skill.skillName, e.target.value)}
        className="bg-transparent border-none outline-none text-xs font-semibold cursor-pointer"
      >
        {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <button onClick={() => onRemove(skill.skillName)} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ResumeAnalysis() {
  const { auth } = useAuth();
  const fileRef = useRef();

  /* UI state */
  const [step, setStep] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  /* Step 2: extracted skills */
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [extractedCareerGoal, setExtractedCareerGoal] = useState("");
  const [candidateSummary, setCandidateSummary] = useState("");
  const [savingToProfile, setSavingToProfile] = useState(false);
  const [savedToProfile, setSavedToProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  /* Step 3: career analysis */
  const [allCareers, setAllCareers] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [expandedCareer, setExpandedCareer] = useState(null);

  /* ── File reading ── */
  const readFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setAiError("");

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      try {
        await new Promise((resolve, reject) => {
          if (window.pdfjsLib) return resolve();
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          fullText += content.items.map((item) => item.str).join(" ") + "\n";
        }

        if (!fullText.trim()) {
          setAiError("Could not extract text from this PDF. Try pasting your resume text below.");
        } else {
          setResumeText(fullText.trim());
        }
      } catch (err) {
        console.error("PDF parse error:", err);
        setAiError("Could not read PDF. Try pasting your resume text directly.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setResumeText(e.target.result);
      reader.readAsText(file);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    readFile(e.dataTransfer.files[0]);
  }, []);

  /* ── Step 1 → 2: Extract skills via AI ── */
  const extractSkills = async () => {
    if (!resumeText.trim()) return;
    setAiLoading(true);
    setAiError("");

    try {
      const systemPrompt = `You are a resume parser. Extract structured information from resumes and return ONLY valid JSON with no markdown, no code blocks, no backticks, no explanation — just raw JSON.`;

      const userPrompt = `Parse this resume and extract:
1. A list of technical and professional skills with proficiency levels
2. The candidate's main career goal or target role
3. A 2-sentence candidate summary

You MUST respond with ONLY this exact JSON structure. No backticks, no markdown, no extra text:
{"candidateSummary":"string","careerGoal":"string","skills":[{"skillName":"string","proficiencyLevel":"Beginner or Intermediate or Advanced or Expert","category":"string"}]}

Resume text:
${resumeText.slice(0, 4000)}`;

      const response = await api.post("/api/ai/chat", { systemPrompt, prompt: userPrompt });
      const raw = response.data?.choices?.[0]?.message?.content || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found");
      const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));

      setExtractedSkills(parsed.skills || []);
      setExtractedCareerGoal(parsed.careerGoal || "");
      setCandidateSummary(parsed.candidateSummary || "");
      setSavedToProfile(false);
      setSaveMessage("");
      setStep(2);
    } catch (err) {
      console.error(err);
      setAiError("Failed to parse resume. Check your connection or paste the resume text again.");
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Skill editor helpers ── */
  const removeSkill = (name) => setExtractedSkills((s) => s.filter((x) => x.skillName !== name));
  const changeLevel = (name, level) =>
    setExtractedSkills((s) => s.map((x) => (x.skillName === name ? { ...x, proficiencyLevel: level } : x)));
  const addSkillManually = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const name = e.target.value.trim();
      if (!extractedSkills.find((s) => s.skillName.toLowerCase() === name.toLowerCase())) {
        setExtractedSkills((s) => [...s, { skillName: name, proficiencyLevel: "Intermediate", category: "Other" }]);
      }
      e.target.value = "";
    }
  };

  /* ── Save skills to profile (Step 2 action) ── */
  const saveSkillsToProfile = async () => {
    setSavingToProfile(true);
    setSaveMessage("");
    try {
      const platformSkillsRes = await api.get("/api/skill");
      const platformSkills = platformSkillsRes.data;
      const nameToId = {};
      platformSkills.forEach((s) => { nameToId[s.skillName.toLowerCase()] = s.id; });

      const existingRes = await api.get(`/api/user/${auth.userId}/skill`);
      const existingIds = new Set(existingRes.data.map((s) => s.skillId));

      const toAdd = extractedSkills.filter((s) => {
        const id = nameToId[s.skillName.toLowerCase()];
        return id && !existingIds.has(id);
      });

      const toUpdate = extractedSkills.filter((s) => {
        const id = nameToId[s.skillName.toLowerCase()];
        return id && existingIds.has(id);
      });

      const addResults = await Promise.allSettled(
        toAdd.map((s) =>
          api.post(`/api/user/${auth.userId}/skill`, {
            skillId: nameToId[s.skillName.toLowerCase()],
            proficiencyLevel: s.proficiencyLevel,
          })
        )
      );

      const updateResults = await Promise.allSettled(
        toUpdate.map((s) =>
          api.put(`/api/user/${auth.userId}/skillFromResume`, {
            skillId: nameToId[s.skillName.toLowerCase()],
            proficiencyLevel: s.proficiencyLevel,
          })
        )
      );

      const added = addResults.filter((r) => r.status === "fulfilled").length;
      const updated = updateResults.filter((r) => r.status === "fulfilled").length;
      const matched = extractedSkills.filter((s) => nameToId[s.skillName.toLowerCase()]).length;
      const unmatched = extractedSkills.length - matched;

      setSavedToProfile(true);
      setSaveMessage(
        `✓ ${added} skill${added !== 1 ? "s" : ""} added, ${updated} updated to your profile.` +
        (unmatched > 0 ? ` (${unmatched} not in platform catalogue)` : "")
      );
    } catch (err) {
      console.error(err);
      setSaveMessage("Failed to save skills. Please try again.");
    } finally {
      setSavingToProfile(false);
    }
  };

  /* ── Step 2 → 3: Career analysis ── */
  const runAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisError("");
    try {
      const [careersRes, skillsRes] = await Promise.all([api.get("/api/career"), api.get("/api/skill")]);
      const careers = careersRes.data;
      const platformSkills = skillsRes.data;
      setAllCareers(careers);
      setAllSkills(platformSkills);

      const nameToId = {};
      platformSkills.forEach((s) => { nameToId[s.skillName.toLowerCase()] = s.id; });

      const userSkillMap = {};
      extractedSkills.forEach((es) => {
        const id = nameToId[es.skillName.toLowerCase()];
        if (id) userSkillMap[id] = es.proficiencyLevel;
      });

      const results = careers
        .map((career) => {
          const required = career.requiredSkills || [];
          if (required.length === 0) return null;

          const gaps = required.map((req) => {
            const userLevel = userSkillMap[req.skillId];
            const matched = userLevel && levelValue(userLevel) >= levelValue(req.requiredLevel);
            return {
              skillId: req.skillId,
              skillName: req.skillName,
              requiredLevel: req.requiredLevel,
              userLevel: userLevel || null,
              matched: !!matched,
            };
          });

          const matchedCount = gaps.filter((g) => g.matched).length;
          const matchPercentage = (matchedCount / required.length) * 100;

          return {
            careerId: career.id,
            careerName: career.careerName,
            description: career.description,
            demandLevel: career.demandLevel,
            averageSalary: career.averageSalary,
            matchPercentage,
            skillGaps: gaps,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      setAnalysisResults(results);
      setStep(3);
    } catch (err) {
      console.error(err);
      setAnalysisError("Failed to run analysis. Please ensure you are logged in.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setResumeText("");
    setFileName("");
    setExtractedSkills([]);
    setAnalysisResults([]);
    setSavedToProfile(false);
    setSaveMessage("");
  };

  /* ─── RENDER ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-200 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Resume Career Analysis</h1>
          <p className="text-slate-500 mt-2 text-sm">Upload your resume → AI extracts skills → Review & save → Analyse career fit</p>
        </div>

        <Steps current={step} />

        {/* ══════════ STEP 1: Upload ══════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200
                ${dragging ? "border-indigo-500 bg-indigo-50 scale-[1.01]" : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40"}
                ${fileName ? "bg-emerald-50/40 border-emerald-300" : ""}`}
            >
              <input ref={fileRef} type="file" accept=".txt,.md,.pdf" className="hidden"
                onChange={(e) => readFile(e.target.files[0])} />
              {fileName ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-emerald-700">{fileName}</p>
                  <p className="text-xs text-slate-400">Click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Drop your resume here</p>
                    <p className="text-xs text-slate-400 mt-1">Supports .txt, .md, .pdf</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Or paste resume text</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                placeholder="Paste your resume content here..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none text-sm text-slate-700 bg-white shadow-sm"
              />
            </div>

            {aiError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{aiError}</div>
            )}

            <button
              onClick={extractSkills}
              disabled={!resumeText.trim() || aiLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base
                hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-3"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Analysing Resume with AI…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Extract Skills with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* ══════════ STEP 2: Review & Save Skills ══════════ */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Candidate summary */}
            {candidateSummary && (
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">AI Summary</p>
                <p className="text-slate-700 text-sm leading-relaxed">{candidateSummary}</p>
                {extractedCareerGoal && (
                  <div className="mt-3 pt-3 border-t border-indigo-100">
                    <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">Detected Career Goal</p>
                    <p className="text-slate-700 text-sm font-medium">{extractedCareerGoal}</p>
                  </div>
                )}
              </div>
            )}

            {/* Skill chips editor */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800">
                  Extracted Skills
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {extractedSkills.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Adjust levels or remove incorrect skills</p>
              </div>

              {extractedSkills.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-sm">No skills extracted. Add skills manually below.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-5">
                  {extractedSkills.map((skill) => (
                    <SkillChip key={skill.skillName} skill={skill}
                      onLevelChange={changeLevel} onRemove={removeSkill} />
                  ))}
                </div>
              )}

              <input
                type="text"
                placeholder="+ Add a skill manually (press Enter)"
                onKeyDown={addSkillManually}
                className="w-full px-4 py-3 rounded-xl border border-dashed border-slate-200 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-slate-50"
              />
            </div>

            {/* Save to profile section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-1">Save Skills to Your Profile</h3>
                  <p className="text-sm text-slate-500">
                    Save matched skills to your profile so they appear in recommendations. Skills not in the platform catalogue will be skipped.
                  </p>
                  {saveMessage && (
                    <div className={`mt-3 p-3 rounded-xl text-sm font-medium ${savedToProfile ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {saveMessage}
                    </div>
                  )}
                </div>
                <button
                  onClick={saveSkillsToProfile}
                  disabled={savingToProfile || extractedSkills.length === 0}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50
                    ${savedToProfile
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200'}`}
                >
                  {savingToProfile ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : savedToProfile ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save to Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {analysisError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{analysisError}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={runAnalysis}
                disabled={extractedSkills.length === 0 || analysisLoading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold
                  hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-40
                  flex items-center justify-center gap-3"
              >
                {analysisLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Running Career Analysis…
                  </>
                ) : "Analyse Career Fit →"}
              </button>
            </div>
          </div>
        )}

        {/* ══════════ STEP 3: Career Analysis Results ══════════ */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  Career Gap Analysis
                  <span className="ml-3 text-sm font-medium text-slate-400">
                    {analysisResults.length} careers
                  </span>
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">Based on {extractedSkills.length} skills from your resume</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  ← Edit Skills
                </button>
                <button
                  onClick={resetAll}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  New Analysis
                </button>
              </div>
            </div>

            {/* Skills snapshot */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Skills Used in Analysis</h3>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((s) => {
                  const levelColors = {
                    Beginner: "bg-yellow-50 border-yellow-200 text-yellow-700",
                    Intermediate: "bg-blue-50 border-blue-200 text-blue-700",
                    Advanced: "bg-purple-50 border-purple-200 text-purple-700",
                    Expert: "bg-emerald-50 border-emerald-200 text-emerald-700",
                  };
                  return (
                    <span key={s.skillName} className={`px-3 py-1 rounded-full text-xs font-semibold border ${levelColors[s.proficiencyLevel] || levelColors.Intermediate}`}>
                      {s.skillName} · {s.proficiencyLevel}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Career cards */}
            {analysisResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-500">No careers with required skills found in the platform yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analysisResults.map((career) => {
                  const pct = Math.round(career.matchPercentage);
                  const mc = matchColor(pct);
                  const isExpanded = expandedCareer === career.careerId;
                  const gaps = career.skillGaps || [];
                  const met = gaps.filter((g) => g.matched);
                  const unmet = gaps.filter((g) => !g.matched);

                  return (
                    <div key={career.careerId}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* Card header */}
                      <div className="flex items-center gap-5 p-5">
                        <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${mc.bar} flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-extrabold text-lg">{pct}%</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg leading-tight">{career.careerName}</h3>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{career.description}</p>
                            </div>
                            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${mc.badge}`}>
                              {matchLabel(pct)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div className={`h-2 rounded-full bg-gradient-to-r ${mc.bar} transition-all duration-700`}
                                style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {met.length}/{gaps.length} skills met
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>💰 ${career.averageSalary?.toLocaleString() || "N/A"}/yr</span>
                            <span>📈 Demand: {career.demandLevel}/5</span>
                            {unmet.length > 0 && (
                              <span className="text-rose-500 font-medium">{unmet.length} gap{unmet.length !== 1 ? "s" : ""} to close</span>
                            )}
                            {unmet.length === 0 && (
                              <span className="text-emerald-600 font-medium">All requirements met! 🎉</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedCareer(isExpanded ? null : career.careerId)}
                          className="shrink-0 w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
                        >
                          <svg className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 px-5 pb-5 pt-4 bg-slate-50/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                                ✓ Skills You Have ({met.length})
                              </h4>
                              <div className="space-y-2">
                                {met.map((g) => (
                                  <div key={g.skillId} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs">
                                    <span className="font-semibold text-slate-700">{g.skillName}</span>
                                    <div className="flex items-center gap-2 text-emerald-600">
                                      <span>{g.userLevel}</span>
                                      <span className="text-slate-300">→</span>
                                      <span className="text-slate-500">{g.requiredLevel} req.</span>
                                    </div>
                                  </div>
                                ))}
                                {met.length === 0 && <p className="text-xs text-slate-400 italic">None matched yet</p>}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">
                                ✗ Gaps to Close ({unmet.length})
                              </h4>
                              <div className="space-y-2">
                                {unmet.map((g) => (
                                  <div key={g.skillId} className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs">
                                    <span className="font-semibold text-slate-700">{g.skillName}</span>
                                    <div className="flex items-center gap-2 text-rose-600">
                                      <span>{g.userLevel ? `${g.userLevel} →` : "Missing →"}</span>
                                      <span className="font-semibold">{g.requiredLevel}</span>
                                    </div>
                                  </div>
                                ))}
                                {unmet.length === 0 && (
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
                                    🎉 You meet all requirements!
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}