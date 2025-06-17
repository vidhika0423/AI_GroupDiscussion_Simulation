import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gdTopics from './topics.json'; 
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [customTopic, setCustomTopic] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleTopicSelect = (type) => {
    let topic = '';

    if (type === 'contemporary') {
      const list = gdTopics.contemporary_topics;
      topic = list[Math.floor(Math.random() * list.length)];
    } else if (type === 'abstract') {
      const list = gdTopics.abstract_topics;
      topic = list[Math.floor(Math.random() * list.length)];
    }

    if (topic) {
      setSelectedTopic(topic);
    }
  };

  const handleCustomTopic = () => {
    if (customTopic.trim() !== '') {
      setSelectedTopic(customTopic.trim());
    }
  };

  const handleStart = () => {
    if (selectedTopic) {
      navigate('/room', { state: { topic: selectedTopic } });
    } else {
      alert('Please select or enter a topic first!');
    }
  };

  return (
    <div className="containerbox">
      <div className="box box-left">
        <h2 className="heading">Select Topic Style</h2>

        <button className="btn" onClick={() => handleTopicSelect('contemporary')}>
          Contemporary Topic
        </button>

        <button className="btn" onClick={() => handleTopicSelect('abstract')}>
          Abstract Topic
        </button>

        <button className="btn" onClick={() => setShowInput(true)}>
          Enter Your Own Topic
        </button>

        {showInput && (
          <div className="input-container">
            <input
              type="text"
              className="custom-input"
              placeholder="Type your GD topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
            <button className="btn" onClick={handleCustomTopic}>
              Set Topic
            </button>
          </div>
        )}

        {selectedTopic && (
          <p className="selected-topic">
            <strong>Selected Topic:</strong> {selectedTopic}
          </p>
        )}
      </div>

      <div className="box box-right">
        <h2 className="heading">Rules</h2>
        <ul className="rules">
          <li>Stay Relevant – Speak on the topic, avoid going off-track.</li>
          <li>Be Clear – Communicate your points with clarity and confidence.</li>
          <li>Be Concise – Make your points brief and impactful.</li>
          <li>Support Your Views – Use logic, examples, or data.</li>
          <li>Engage Respectfully – Disagree politely, avoid personal attacks.</li>
          <li>Maintain Flow – Help the discussion move smoothly without stagnation.</li>
          <li>Your performance will be assessed on the following:</li>
          <ul>
            <li>Content Relevance</li>
            <li>Logical Flow</li>
            <li>Depth of Argument</li>
            <li>Communication Clarity</li>
            <li>Vocabulary & Language</li>
          </ul>
        </ul>
        <button className="start-btn" onClick={handleStart}>
          Start
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
