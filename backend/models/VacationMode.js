import mongoose from 'mongoose';

const vacationModeSchema = new mongoose.Schema({
    isEnabled: {
        type: Boolean,
        default: false
    }
});

const VacationMode = mongoose.model('VacationMode', vacationModeSchema);

export default VacationMode; 