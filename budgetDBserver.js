const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL || 5000, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.log(`Connection error: ${err}`);
    });

// Создаем модель данных
const budgetRecordSchema = new mongoose.Schema({
    date: String,
    amount: Number,
    type: String,
    transactionType: [String], // Массив строк для типов транзакций
});

const BudgetRecord = mongoose.model('BudgetRecord', budgetRecordSchema);

// API для добавления записи в базу данных
app.post('/api/add-record', (req, res) => {
    const { date, amount, type, transactionType } = req.body;

    const newRecord = new BudgetRecord({
        date,
        amount,
        type,
        transactionType, // Включите transactionType в создание записи
    });

    newRecord.save()
        .then(() => {
            console.log('Запись добавлена в базу данных.');
            res.status(200).send('Запись добавлена в базу данных.');
        })
        .catch((error) => {
            console.error('Ошибка при добавлении записи:', error);
            res.status(500).send('Ошибка при добавлении записи.');
        });
});

// API для получения всех записей из базы данных
app.get('/api/get-records', (req, res) => {
    BudgetRecord.find({})
        .then((records) => {
            console.log('Данные из базы данных:', records);
            res.status(200).json(records);
        })
        .catch((error) => {
            console.error('Ошибка при получении данных из базы данных:', error);
            res.status(500).send('Ошибка при получении данных из базы данных.');
        });
});
app.put('/api/change-record/:recordId', async (req, res) => {
    const recordId = req.params.recordId;
    const { date, amount, type, transactionType } = req.body;

    try {
        const updatedRecord = await Transaction.findByIdAndUpdate(recordId, {
            date,
            amount,
            type,
            transactionType,
        }, { new: true }); // { new: true } возвращает обновленную запись

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }

        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = app;