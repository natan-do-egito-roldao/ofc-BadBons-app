exports.createAthlete = async (req, res) => {
    try {
        const athlete = new Athlete(req.body);
        await athlete.save();
        res.status(201).json({ message: 'Atleta criado com sucesso!', athlete });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
