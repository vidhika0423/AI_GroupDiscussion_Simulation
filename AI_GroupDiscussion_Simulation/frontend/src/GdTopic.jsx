import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gdTopics from 'topics.json'; 

const SelectTopic = () => {
  const navigate = useNavigate();
  const [customTopic, setCustomTopic] = useState('');
  const [showInput, setShowInput] = useState(false);

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
      navigate('/gd-room', { state: { topic } });
    }
  };

  const handleCustomSubmit = () => {
    if (customTopic.trim() !== '') {
      navigate('/gd-room', { state: { topic: customTopic.trim() } });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-xl font-semibold mb-4">Select a GD Topic</h2>

      <button
        onClick={() => handleTopicSelect('contemporary')}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
      >
        Contemporary Topic
      </button>

      <button
        onClick={() => handleTopicSelect('abstract')}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow"
      >
        Abstract Topic
      </button>

      <button
        onClick={() => setShowInput(true)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl shadow"
      >
        Enter Custom Topic
      </button>

      {showInput && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter your GD topic"
            className="border px-4 py-2 rounded w-64"
          />
          <button
            onClick={handleCustomSubmit}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl shadow"
          >
            Start GD
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectTopic;
