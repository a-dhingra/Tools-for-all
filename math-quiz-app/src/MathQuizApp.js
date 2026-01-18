import React, { useState, useEffect } from 'react';
import { Settings, Trophy, Mail, BookOpen, Brain, ChevronRight, Loader, Key, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import emailjs from '@emailjs/browser';

const MathQuizApp = () => {
  const [screen, setScreen] = useState('home');
  const [studentName, setStudentName] = useState('');
  const [topics] = useState([
    'Arithmetic operations',
    'Fractions',
    'Decimals',
    'Ratios and proportions',
    'Percentages',
    'Basic geometry',
    'Measurement',
    'Data and statistics'
  ]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [sourceUrls, setSourceUrls] = useState(['https://www.khanacademy.org/math/get-ready-for-6th-grade']);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [numQuestions, setNumQuestions] = useState(20);

  // API Configuration
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [emailjsServiceId, setEmailjsServiceId] = useState('');
  const [emailjsTemplateId, setEmailjsTemplateId] = useState('');
  const [emailjsPublicKey, setEmailjsPublicKey] = useState('');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);

  const motivationalQuotes = [
    "The only way to learn mathematics is to do mathematics. - Paul Halmos",
    "Mathematics is not about numbers, equations, or algorithms: it is about understanding. - William Paul Thurston",
    "Without mathematics, there's nothing you can do. Everything around you is mathematics. - Shakuntala Devi",
    "Mathematics is the music of reason. - James Joseph Sylvester",
    "In mathematics, you don't understand things. You just get used to them. - John von Neumann",
    "Pure mathematics is, in its way, the poetry of logical ideas. - Albert Einstein",
    "Mathematics knows no races or geographic boundaries; for mathematics, the cultural world is one country. - David Hilbert",
    "The study of mathematics is apt to commence in disappointment. - Alfred North Whitehead",
    "Mathematics is the most beautiful and most powerful creation of the human spirit. - Stefan Banach",
    "Life is a math equation. In order to gain the most, you have to know how to convert negatives into positives. - Anonymous",
    "Mathematics is the door and key to the sciences. - Roger Bacon",
    "The essence of mathematics is not to make simple things complicated, but to make complicated things simple. - Stan Gudder",
    "Mathematics is the language with which God has written the universe. - Galileo Galilei",
    "Do not worry about your difficulties in mathematics. I can assure you mine are still greater. - Albert Einstein",
    "Everything around you is mathematics. Everything around you is numbers. - Shakuntala Devi",
    "The laws of nature are but the mathematical thoughts of God. - Euclid",
    "Mathematics is a place where you can do things which you can't do in the real world. - Marcus du Sautoy",
    "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
    "The expert in anything was once a beginner. - Helen Hayes",
    "Believe you can and you're halfway there. - Theodore Roosevelt"
  ];

  // Load saved config from localStorage
  useEffect(() => {
    const savedEmails = localStorage.getItem('emailRecipients');
    const savedUrls = localStorage.getItem('sourceUrls');
    const savedNumQuestions = localStorage.getItem('numQuestions');
    const savedGeminiKey = localStorage.getItem('geminiApiKey');
    const savedEmailJsServiceId = localStorage.getItem('emailjsServiceId');
    const savedEmailJsTemplateId = localStorage.getItem('emailjsTemplateId');
    const savedEmailJsPublicKey = localStorage.getItem('emailjsPublicKey');

    if (savedEmails) setEmailRecipients(JSON.parse(savedEmails));
    if (savedUrls) setSourceUrls(JSON.parse(savedUrls));
    if (savedNumQuestions) setNumQuestions(parseInt(savedNumQuestions));
    if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
    if (savedEmailJsServiceId) setEmailjsServiceId(savedEmailJsServiceId);
    if (savedEmailJsTemplateId) setEmailjsTemplateId(savedEmailJsTemplateId);
    if (savedEmailJsPublicKey) setEmailjsPublicKey(savedEmailJsPublicKey);

    // Check if APIs are configured
    if (savedGeminiKey && savedEmailJsServiceId && savedEmailJsTemplateId && savedEmailJsPublicKey) {
      setApiConfigured(true);
    }
  }, []);

  const saveApiKeys = () => {
    localStorage.setItem('geminiApiKey', geminiApiKey);
    localStorage.setItem('emailjsServiceId', emailjsServiceId);
    localStorage.setItem('emailjsTemplateId', emailjsTemplateId);
    localStorage.setItem('emailjsPublicKey', emailjsPublicKey);

    if (geminiApiKey && emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
      setApiConfigured(true);
      setShowApiSetup(false);
      alert('API keys saved successfully! You can now generate questions and send results.');
    } else {
      alert('Please fill in all API credentials.');
    }
  };

  const addEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      const updated = [...emailRecipients, newEmail];
      setEmailRecipients(updated);
      localStorage.setItem('emailRecipients', JSON.stringify(updated));
      setNewEmail('');
    }
  };

  const removeEmail = (index) => {
    const updated = emailRecipients.filter((_, i) => i !== index);
    setEmailRecipients(updated);
    localStorage.setItem('emailRecipients', JSON.stringify(updated));
  };

  const addUrl = () => {
    if (newUrl) {
      const updated = [...sourceUrls, newUrl];
      setSourceUrls(updated);
      localStorage.setItem('sourceUrls', JSON.stringify(updated));
      setNewUrl('');
    }
  };

  const removeUrl = (index) => {
    const updated = sourceUrls.filter((_, i) => i !== index);
    setSourceUrls(updated);
    localStorage.setItem('sourceUrls', JSON.stringify(updated));
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  // Generate questions using Google Gemini AI
  const generateQuestions = async () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic!');
      return;
    }
    if (!studentName.trim()) {
      alert('Please enter student name!');
      return;
    }
    if (!geminiApiKey) {
      alert('Please configure Google Gemini API key in Settings > API Setup');
      return;
    }

    setLoading(true);

    try {
      const generatedQuestions = [];

      // Generate questions for each topic
      for (let i = 0; i < numQuestions; i++) {
        const topic = selectedTopics[i % selectedTopics.length];

        const prompt = `Generate a 6th grade mathematics multiple choice question about "${topic}".

Format your response as a JSON object with this exact structure:
{
  "question": "the question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correctAnswer": "the correct option text (must match exactly one of the options)",
  "explanation": "detailed explanation of why this is the correct answer"
}

Requirements:
- Question should be appropriate for 6th grade students
- Provide exactly 4 options
- Make sure correctAnswer matches one of the options exactly
- Provide clear, educational explanation
- Focus on topic: ${topic}`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate question from Gemini API');
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;

        // Extract JSON from the response
        let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const questionData = JSON.parse(jsonMatch[0]);
          generatedQuestions.push({
            topic,
            question: questionData.question,
            options: questionData.options,
            correctAnswer: questionData.correctAnswer,
            explanation: questionData.explanation
          });
        }
      }

      setQuestions(generatedQuestions);
      setUserAnswers([]);
      setCurrentQuestionIndex(0);
      setLoading(false);
      setScreen('quiz');

    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Error generating questions. Please check your API key and try again.\n\nError: ' + error.message);
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!selectedAnswer) {
      alert('Please select an answer!');
      return;
    }

    const newAnswer = {
      question: questions[currentQuestionIndex].question,
      userAnswer: selectedAnswer,
      correctAnswer: questions[currentQuestionIndex].correctAnswer,
      isCorrect: selectedAnswer === questions[currentQuestionIndex].correctAnswer,
      topic: questions[currentQuestionIndex].topic,
      explanation: questions[currentQuestionIndex].explanation,
      options: questions[currentQuestionIndex].options
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);
    setSelectedAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz(updatedAnswers);
    }
  };

  const completeQuiz = async (finalAnswers) => {
    setScreen('complete');
    await generateAndSendReport(finalAnswers);
  };

  // Generate PDF and send via EmailJS
  const generateAndSendReport = async (finalAnswers) => {
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const percentage = ((correctCount / finalAnswers.length) * 100).toFixed(1);

    try {
      // Generate PDF using jsPDF
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Math Quiz Results', 105, 20, { align: 'center' });

      // Student Info
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Student: ${studentName}`, 20, 35);
      doc.text(`Date: ${new Date().toLocaleString()}`, 20, 42);
      doc.text(`Score: ${correctCount}/${finalAnswers.length} (${percentage}%)`, 20, 49);

      // Performance summary
      doc.setFont(undefined, 'bold');
      doc.text('Performance Summary:', 20, 60);
      doc.setFont(undefined, 'normal');

      let performanceText = '';
      if (percentage >= 90) performanceText = 'Excellent work! Outstanding performance!';
      else if (percentage >= 75) performanceText = 'Great job! Keep up the good work!';
      else if (percentage >= 60) performanceText = 'Good effort! Continue practicing!';
      else performanceText = 'Keep practicing! You\'re making progress!';

      doc.text(performanceText, 20, 67);

      // Questions and Answers
      let yPos = 80;

      finalAnswers.forEach((answer, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Question number and topic
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text(`Q${index + 1}. ${answer.topic}`, 20, yPos);
        yPos += 7;

        // Question text (wrap if too long)
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const questionLines = doc.splitTextToSize(answer.question, 170);
        doc.text(questionLines, 20, yPos);
        yPos += questionLines.length * 5;

        // User's answer
        doc.text(`Your answer: ${answer.userAnswer}`, 20, yPos);
        yPos += 5;

        // Correct answer
        doc.text(`Correct answer: ${answer.correctAnswer}`, 20, yPos);
        yPos += 5;

        // Result indicator
        doc.setFont(undefined, 'bold');
        if (answer.isCorrect) {
          doc.setTextColor(0, 128, 0);
          doc.text('✓ CORRECT', 20, yPos);
        } else {
          doc.setTextColor(255, 0, 0);
          doc.text('✗ INCORRECT', 20, yPos);
        }
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        yPos += 7;

        // Explanation (wrap if too long)
        const explanationLines = doc.splitTextToSize(`Explanation: ${answer.explanation}`, 170);
        doc.text(explanationLines, 20, yPos);
        yPos += explanationLines.length * 5 + 5;
      });

      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      // Send email using EmailJS
      if (emailRecipients.length > 0 && emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
        sendEmailWithPDF(pdfBase64, correctCount, percentage);
      } else {
        console.log('Email not configured or no recipients');
        // Download PDF locally as backup
        doc.save(`${studentName}_Math_Quiz_Results.pdf`);
      }

    } catch (error) {
      console.error('Error generating/sending report:', error);
      alert('Error generating report: ' + error.message);
    }
  };

  const sendEmailWithPDF = async (pdfBase64, correctCount, percentage) => {
    try {
      // Initialize EmailJS
      emailjs.init(emailjsPublicKey);

      // Send to each recipient
      for (const recipient of emailRecipients) {
        const templateParams = {
          to_email: recipient,
          student_name: studentName,
          score: `${correctCount}/${userAnswers.length}`,
          percentage: `${percentage}%`,
          date: new Date().toLocaleDateString(),
          pdf_attachment: pdfBase64,
          pdf_name: `${studentName}_Math_Quiz_Results.pdf`
        };

        await emailjs.send(
          emailjsServiceId,
          emailjsTemplateId,
          templateParams
        );
      }

      console.log('Emails sent successfully to:', emailRecipients);

    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. PDF has been downloaded locally instead.');
    }
  };

  const startNewQuiz = () => {
    setScreen('home');
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedTopics([]);
    setSelectedAnswer('');
  };

  // API SETUP SCREEN
  if (showApiSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Key className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">API Configuration</h1>
              </div>
              <button
                onClick={() => setShowApiSetup(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Back
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-2">Important: Keep your API keys secure!</p>
                <p>These keys are stored in your browser's localStorage. Never share them publicly.</p>
              </div>
            </div>

            {/* Google Gemini API */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from: <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google AI Studio</a>
              </p>
            </div>

            {/* EmailJS Service ID */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EmailJS Service ID
              </label>
              <input
                type="text"
                value={emailjsServiceId}
                onChange={(e) => setEmailjsServiceId(e.target.value)}
                placeholder="service_xxxxxxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* EmailJS Template ID */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EmailJS Template ID
              </label>
              <input
                type="text"
                value={emailjsTemplateId}
                onChange={(e) => setEmailjsTemplateId(e.target.value)}
                placeholder="template_xxxxxxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* EmailJS Public Key */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EmailJS Public Key
              </label>
              <input
                type="text"
                value={emailjsPublicKey}
                onChange={(e) => setEmailjsPublicKey(e.target.value)}
                placeholder="Your public key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your credentials from: <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">EmailJS Dashboard</a>
              </p>
            </div>

            <button
              onClick={saveApiKeys}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Save API Configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Brain className="w-10 h-10 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">Math Practice Quiz</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowApiSetup(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    apiConfigured
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  <Key className="w-5 h-5" />
                  API Setup {apiConfigured ? '✓' : '!'}
                </button>
                <button
                  onClick={() => setScreen('config')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </div>
            </div>

            {!apiConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">API Configuration Required</p>
                  <p>Click "API Setup" to configure Google Gemini and EmailJS before starting a quiz.</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Topics ({selectedTopics.length} selected)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      selectedTopics.includes(topic)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-medium">{topic}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateQuestions}
              disabled={loading || !apiConfigured}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating Questions with AI...
                </>
              ) : (
                <>
                  Start Quiz ({numQuestions} Questions)
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CONFIG SCREEN
  if (screen === 'config') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Configuration</h1>
              <button
                onClick={() => setScreen('home')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Back
              </button>
            </div>

            {/* Number of Questions */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Questions Per Session
              </label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNumQuestions(val);
                  localStorage.setItem('numQuestions', val.toString());
                }}
                min="5"
                max="50"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email Recipients */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Recipients for Results
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addEmail}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {emailRecipients.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>{email}</span>
                    <button
                      onClick={() => removeEmail(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {emailRecipients.length === 0 && (
                  <p className="text-gray-500 text-sm">No email recipients configured</p>
                )}
              </div>
            </div>

            {/* Source URLs */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Source URLs
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/topics"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addUrl}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {sourceUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm truncate">{url}</span>
                    <button
                      onClick={() => removeUrl(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  if (screen === 'quiz') {
    const currentQ = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Topic Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {currentQ.topic}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedAnswer === option
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETION SCREEN
  if (screen === 'complete') {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />

            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Congratulations, {studentName}! 🎉
            </h1>

            <p className="text-xl text-gray-600 mb-6">
              You've completed the quiz!
            </p>

            <div className="bg-indigo-50 rounded-xl p-6 mb-8">
              <p className="text-lg italic text-indigo-800">
                "{randomQuote}"
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-gray-700 mb-2">
                {emailRecipients.length > 0
                  ? 'Your results have been sent via email to:'
                  : 'Your results PDF has been downloaded.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {emailRecipients.map((email, index) => (
                  <span key={index} className="inline-block px-3 py-1 bg-white rounded-full text-sm border border-gray-200">
                    {email}
                  </span>
                ))}
                {emailRecipients.length === 0 && (
                  <span className="text-gray-500 text-sm">(Configure email recipients in Settings)</span>
                )}
              </div>
            </div>

            <button
              onClick={startNewQuiz}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition"
            >
              Start New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default MathQuizApp;
