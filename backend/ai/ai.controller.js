export const askAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // For now, provide a mock AI response based on keywords
    let response = "I'm your GuardianBand AI Assistant. How can I help you today?";

    const msg = message.toLowerCase();

    if (msg.includes('child') || msg.includes('routine')) {
      response = "Your child's daily routine is set up nicely! They have school from 8 AM to 3 PM, homework at 4 PM, and dinner at 7 PM. Everything is on track!";
    } else if (msg.includes('health') || msg.includes('heart') || msg.includes('temperature')) {
      response = "Your child's latest health metrics look great! Heart rate is 84 bpm and temperature is 36.7°C - both normal. Keep up the good health monitoring!";
    } else if (msg.includes('location') || msg.includes('geofence') || msg.includes('safe')) {
      response = "Your child is currently at school within the safe zone. All geofences are active and monitoring is enabled. Everything is secure!";
    } else if (msg.includes('battery') || msg.includes('device')) {
      response = "Your GuardianBand device is in excellent condition! Battery at 78%, all sensors working normally. Last sync was just now.";
    } else if (msg.includes('alert')) {
      response = "You have 3 unread alerts - all are low priority. One about battery reaching 80%, one location update, and one health check. No critical alerts at the moment.";
    } else if (msg.includes('help')) {
      response = "I can help you with: routines, health monitoring, location tracking, device status, alerts, and more! Just ask me anything about your child's safety and well-being.";
    }

    return res.status(200).json({
      message: 'AI response generated',
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI ask error:', error);
    return res.status(500).json({ message: 'Server error processing AI request' });
  }
};

export default { askAI };
