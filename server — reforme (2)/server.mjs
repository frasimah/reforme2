import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

// ВАЖНО: Используй Private API Key, который начинается с klaviyo_
const KLAVIYO_API_KEY = 'pk_ab0e5c053b730d39ccb302d19833b16119';
const KLAVIYO_LIST_ID = 'S8HGYr';

app.use(cors());
app.use(express.json());

app.post('/klaviyo-subscribe', async (req, res) => {
   const { email, name } = req.body;

   if (!email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
   }

   try {
      // 1. Создаем или обновляем профиль
      const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
         method: 'POST',
         headers: {
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'revision': '2024-10-15'
         },
         body: JSON.stringify({
            data: {
               type: "profile",
               attributes: {
                  email,
                  first_name: name
               }
            }
         }),
      });

      if (!profileResponse.ok) {
         const errorData = await profileResponse.json();
         return res.status(profileResponse.status).json(errorData);
      }

      const profileData = await profileResponse.json();
      const profileId = profileData.data.id;

      // 2. Добавляем профиль в список
      const listResponse = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
         method: 'POST',
         headers: {
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'revision': '2024-10-15'
         },
         body: JSON.stringify({
            data: [
               {
                  type: "profile",
                  id: profileId
               }
            ]
         }),
      });

      if (!listResponse.ok) {
         const errorData = await listResponse.json();
         return res.status(listResponse.status).json(errorData);
      }

      return res.json({ success: true, message: 'Subscribed successfully!' });

   } catch (error) {
      console.error('Subscription error:', error);
      return res.status(500).json({ error: 'Server error. Please try again.' });
   }
});

app.listen(PORT, '0.0.0.0', () => {
   console.log(`Server running on http://94.228.162.247:${PORT}`);
});
