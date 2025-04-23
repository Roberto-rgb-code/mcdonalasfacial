import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

// Fictional customer data with purchase history and simulated face descriptors
const customerData = {
  "user1": {
    name: "Juan",
    purchaseHistory: [
      { name: "Oreo McFlurry™", frequency: 5 },
      { name: "Apple Pie", frequency: 3 },
      { name: "Corn Cup", frequency: 1 },
    ],
    faceDescriptor: new Float32Array(Array(128).fill(0).map(() => Math.random() * 0.2 - 0.1)),
  },
  "user2": {
    name: "Maria",
    purchaseHistory: [
      { name: "Sundae Cone", frequency: 4 },
      { name: "ChocoTop™", frequency: 2 },
      { name: "Sundae (Chocolate/Strawberry)", frequency: 1 },
    ],
    faceDescriptor: new Float32Array(Array(128).fill(0).map(() => Math.random() * 0.2 + 0.1)),
  },
};

// Menu items
const menuItems = [
  { name: "Sundae Cone", price: 1.00, img: "/sundai cono.png" },
  { name: "Sundae (Chocolate/Strawberry)", price: 2.70, img: "/sundai.png" },
  { name: "ChocoTop™", price: 0.00, img: "chocotop.png" },
  { name: "Oreo McFlurry™", price: 0.00, img: "oreo mc.jpg" },
  { name: "Apple Pie", price: 0.00, img: "/aple pie.jpg" },
  { name: "Corn Cup", price: 0.00, img: "corn cup.jpg" },
  { name: "Mango Shake", price: 3.50, img: "/mango.jpg" },
  { name: "Express Combo", price: 5.00, img: "/combo.jpg" },
  { name: "Fries", price: 2.00, img: "/fries.jpg" },
  { name: "Soft Drink", price: 1.50, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=50" },
];

// Left sidebar icons
const sidebarItems = [
  { name: "Burgers", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=50" },
  { name: "Fries", img: "/fries.jpg" },
  { name: "Drinks", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=50" },
  { name: "Desserts", img: "desser.jpg" },
  { name: "Kids Meal", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=50" },
];

// Emotion-based messages and recommendations with improved tone
const emotionResponses = {
  happy: {
    message: "🎈 ¡Estás brillando de alegría! Te mereces un Happy Boost: un Sundae Cone gratis + una bebida refrescante para seguir celebrando! 🥤 ¿Qué dices?",
    recommendation: "Sundae Cone",
    secondaryRecommendation: "Soft Drink",
    offer: "¡Un Sundae Cone GRATIS con tu pedido, porque te lo mereces! 🎁"
  },
  sad: {
    message: "💖 ¡Te mereces un abrazo de McDonald’s! Prueba nuestro Comfort Meal: Apple Pie + Café Caliente GRATIS para calmar tu día. ☕🍎 ¡Todo estará bien! 🌟",
    recommendation: "Apple Pie",
    secondaryRecommendation: "Soft Drink",
    offer: "¡Café GRATIS con tu Apple Pie para sacarte una sonrisa! 🍎"
  },
  frustrated: {
    message: "🌟 ¡No dejes que el día te gane! Prueba nuestro Stress Buster Meal: un Combo Express + una bebida refrescante para relajarte. 🍔🥤 ¡Tú puedes con todo! 💪",
    recommendation: "Express Combo",
    secondaryRecommendation: "Soft Drink",
    offer: "¡Bebida GRATIS con tu Combo Express para aliviar el estrés! 🥤"
  },
};

// Simulate emotions for testing (cycle through emotions)
const simulateEmotions = ["happy", "sad", "frustrated"];
let emotionIndex = 0;

const App = () => {
  const [cart, setCart] = useState([]);
  const [videoStarted, setVideoStarted] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [recommendedItem, setRecommendedItem] = useState(null);
  const [emotionOffer, setEmotionOffer] = useState(null);
  const [historyRecommendation, setHistoryRecommendation] = useState(null);
  const [uniqueCombo, setUniqueCombo] = useState(null);
  const [secondaryRecommendation, setSecondaryRecommendation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [recognizedUser, setRecognizedUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [emotionDetectionCount, setEmotionDetectionCount] = useState(0);
  const videoRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights"),
        faceapi.nets.faceLandmark68Net.loadFromUri("https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights"),
        faceapi.nets.faceRecognitionNet.loadFromUri("https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights"),
        faceapi.nets.faceExpressionNet.loadFromUri("https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights"),
      ]);
    };
    loadModels();
  }, []);

  // Start video and simulate facial recognition (runs only once for user detection)
  const startVideo = async () => {
    setVideoStarted(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = async () => {
      const detect = async () => {
        setScanning(true);

        // Simulate scanning for 2 seconds before proceeding
        setTimeout(() => {
          // Simulate facial recognition (always recognize "user1" for testing)
          const recognizedUserId = "user1";
          const user = customerData[recognizedUserId];
          setRecognizedUser(user);
          const userHistory = user.purchaseHistory;
          if (userHistory) {
            const mostFrequent = userHistory.reduce((prev, curr) =>
              prev.frequency > curr.frequency ? prev : curr
            );
            setHistoryRecommendation(mostFrequent.name);

            // Preload cart with most frequent item
            const mostFrequentItem = menuItems.find(item => item.name === mostFrequent.name);
            if (mostFrequentItem && !cart.some(item => item.name === mostFrequent.name)) {
              setCart([...cart, { ...mostFrequentItem, quantity: 1 }]);
            }

            // Suggest a unique combo with a more exciting message
            setUniqueCombo({
              message: "🌟 ¡Sorpresa del Día! Gira la Rueda de la Suerte y prueba nuestro nuevo Batido de Mango 🥭 ¡Obtén 50 Puntos de Lealtad Extra (Valor: Family) si lo pides en los próximos 5 minutos! ⏳",
              item: "Mango Shake",
              loyaltyPoints: "🎉 ¡Gana 50 Puntos de Lealtad Extra (Valor: Family) al pedir este combo hoy!"
            });
          }

          // Perform the first emotion detection
          detectNextEmotion();

          setScanning(false);

          // Stop the video stream after user detection
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
          }
        }, 2000); // Simulate scanning for 2 seconds
      };
      detect();
    };
  };

  // Function to detect the next emotion
  const detectNextEmotion = () => {
    if (emotionDetectionCount < 3) {
      const simulatedEmotion = simulateEmotions[emotionIndex];
      emotionIndex = (emotionIndex + 1) % simulateEmotions.length;
      setEmotion(simulatedEmotion);

      // Emotion-based response
      const emotionResponse = emotionResponses[simulatedEmotion];
      setRecommendedItem(emotionResponse.recommendation);
      setSecondaryRecommendation(emotionResponse.secondaryRecommendation);
      setEmotionOffer(emotionResponse.offer);

      setEmotionDetectionCount(prevCount => prevCount + 1);
    }
  };

  // Reset scanning to try again
  const resetScanning = () => {
    setVideoStarted(false);
    setEmotion(null);
    setRecommendedItem(null);
    setSecondaryRecommendation(null);
    setEmotionOffer(null);
    setHistoryRecommendation(null);
    setUniqueCombo(null);
    setRecognizedUser(null);
    setScanning(false);
    setEmotionDetectionCount(0);
    emotionIndex = 0;
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Add item to cart
  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity }]);
    setSelectedItem(null);
    setQuantity(1);

    // Update purchase history if user is recognized
    if (recognizedUser) {
      const userId = Object.keys(customerData).find(id => customerData[id].name === recognizedUser.name);
      if (userId) {
        const history = customerData[userId].purchaseHistory;
        const existingItem = history.find(entry => entry.name === item.name);
        if (existingItem) {
          existingItem.frequency += quantity;
        } else {
          history.push({ name: item.name, frequency: quantity });
        }
      }
    }
  };

  // Select item to show quantity controls
  const selectItem = (item) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  // Add personalized combo to cart (main item + secondary item)
  const addPersonalizedComboToCart = (mainItemName, secondaryItemName) => {
    const mainItem = menuItems.find(item => item.name === mainItemName);
    const secondaryItem = secondaryItemName ? menuItems.find(item => item.name === secondaryItemName) : null;

    if (mainItem) {
      setCart([...cart, { ...mainItem, quantity: 1 }]);
    }
    if (secondaryItem) {
      setCart(prevCart => [...prevCart, { ...secondaryItem, quantity: 1 }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      {/* Left Sidebar */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-4">
        {sidebarItems.map((item, index) => (
          <div key={index} className="mb-4">
            <img
              src={item.img}
              alt={item.name}
              className="w-12 h-12 object-cover rounded"
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-yellow-400 p-4 flex justify-center items-center">
          <img
            src="/mcdonalds-.jpg"
            alt="Header"
            className="w-full h-20 object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=50";
            }}
          />
        </div>

        {/* Main Section */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Ordena & disfruta</h1>
            <div className="border rounded-full px-4 py-2 flex items-center bg-white shadow-sm">
              <span className="text-gray-600">Search</span>
              <svg className="w-5 h-5 ml-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
              </svg>
            </div>
          </div>

          {/* Facial Recognition Section */}
          {!videoStarted ? (
            <div className="flex justify-center mb-6">
              <button
                onClick={startVideo}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200"
              >
                Start Facial Recognition
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-64 h-48 border rounded mx-auto"
              ></video>
              {scanning && (
                <p className="mt-2 text-blue-500 animate-pulse text-center font-semibold text-lg">
                  Escaneando rostro... 🔍
                </p>
              )}
              {recognizedUser && !scanning && (
                <>
                  <div
                    className="mt-2 text-center font-semibold text-xl bg-green-100 p-4 rounded-lg shadow-lg border border-green-300 animate-bounce-rotate"
                    style={{ background: 'linear-gradient(to right, #34C759, #28A745)' }}
                  >
                    <p className="text-white">
                      🎉 ¡Juan, eres un VIP en McDonald’s! 🎈
                    </p>
                    <p className="text-yellow-200">
                      Te hemos preparado un <span className="font-bold">Combo Personalizado</span>: tu favorito <span className="font-bold">{historyRecommendation}</span> + unas Papas Crujientes 🍟 ¡Solo para ti hoy! ¿Te animas?
                    </p>
                    <button
                      onClick={() => addPersonalizedComboToCart(historyRecommendation, "Fries")}
                      className="mt-2 bg-yellow-500 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                    >
                      ¡Añadir Combo Personalizado! 🍟
                    </button>
                  </div>
                  {uniqueCombo && (
                    <div
                      className="mt-2 text-center font-semibold text-lg bg-yellow-100 p-4 rounded-lg shadow-lg border border-yellow-300 animate-slide-pulse"
                      style={{ background: 'linear-gradient(to right, #FFD700, #FFC107)' }}
                    >
                      <p className="text-gray-800">{uniqueCombo.message}</p>
                      <p className="text-red-600 font-bold">{uniqueCombo.loyaltyPoints}</p>
                      <button
                        onClick={() => addToCart(menuItems.find(item => item.name === uniqueCombo.item))}
                        className="mt-2 bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        ¡Pedir Ahora! ⏳
                      </button>
                    </div>
                  )}
                </>
              )}
              {emotion && !scanning && (
                <div
                  className="mt-2 text-center font-semibold text-lg bg-gray-100 p-3 rounded-lg shadow-md border border-gray-300 animate-shake"
                >
                  <p className="text-gray-800">{emotionResponses[emotion]?.message}</p>
                  <button
                    onClick={() => addPersonalizedComboToCart(emotionResponses[emotion].recommendation, emotionResponses[emotion].secondaryRecommendation)}
                    className="mt-2 bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    {emotion === "happy" ? "¡Añadir Happy Boost! 🥤" : emotion === "sad" ? "¡Añadir Comfort Meal! ☕" : "¡Añadir Stress Buster Meal! 💪"}
                  </button>
                </div>
              )}
              {recommendedItem && !scanning && (
                <p className="mt-2 text-center text-gray-700 font-semibold">
                  Recomendación: <span className="font-bold text-yellow-600">{recommendedItem}</span>
                </p>
              )}
              {emotionOffer && !scanning && (
                <p
                  className="mt-2 text-center text-yellow-600 font-semibold text-lg bg-yellow-100 p-3 rounded-lg shadow-md border border-yellow-300 animate-pop-in"
                  style={{ background: 'linear-gradient(to right, #FFD700, #FFC107)' }}
                >
                  {emotionOffer}
                </p>
              )}
              {videoStarted && !scanning && emotionDetectionCount < 3 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={detectNextEmotion}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Detectar Siguiente Emoción
                  </button>
                </div>
              )}
              {videoStarted && !scanning && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={resetScanning}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Reiniciar Escaneo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer bg-white shadow-sm transition-transform duration-200 hover:scale-105 ${
                  selectedItem?.name === item.name
                    ? "border-yellow-500 border-4"
                    : recommendedItem === item.name
                    ? "border-green-500 border-2"
                    : uniqueCombo?.item === item.name
                    ? "border-purple-500 border-2"
                    : ""
                }`}
                onClick={() => selectItem(item)}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-24 object-cover mb-2 rounded"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/100?text=Image+Not+Found";
                  }}
                />
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-600">RM {item.price.toFixed(2)}</p>
                {recommendedItem === item.name && (
                  <p className="text-green-500 text-sm mt-1">¡Recomendado para ti!</p>
                )}
                {uniqueCombo?.item === item.name && (
                  <p className="text-purple-500 text-sm mt-1">¡Combo Único del Día!</p>
                )}
              </div>
            ))}
          </div>

          {/* Selected Item Controls */}
          {selectedItem && (
            <div className="fixed bottom-20 left-20 right-0 bg-yellow-400 p-4 flex justify-between items-center shadow-lg">
              <p className="font-bold text-gray-800">
                {selectedItem.name} x {quantity} RM {(selectedItem.price * quantity).toFixed(2)}
              </p>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-300 px-3 py-1 rounded text-gray-800 hover:bg-gray-400"
                >
                  -
                </button>
                <span className="mx-2 text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-300 px-3 py-1 rounded text-gray-800 hover:bg-gray-400"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-20 right-0 bg-yellow-200 p-4 flex justify-between items-center shadow-lg">
          <p className="font-bold text-gray-800">{cart.length} Items in List</p>
          <button className="bg-gray-500 text-black px-4 py-2 rounded hover:bg-gray-600">
            View Order List
          </button>
          <button className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-100">
            Cancel Order
          </button>
          {selectedItem && (
            <button
              onClick={() => addToCart(selectedItem)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add to Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;