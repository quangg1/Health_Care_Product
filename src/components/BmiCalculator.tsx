import React, { useEffect, useState } from "react";
import './BmiCalculator.css';

// Helper class from the original code
class Utils {
	static LOCALE = "en-US";
	/**
	 * Get the BMI for metric units.
	 * @param height height in centimeters (cm)
	 * @param weight weight in kilograms (kg)
	 */
	static calcBMIInKg(weight: number, height: number): number {
        if (height === 0) return 0;
		return weight / ((height/100) ** 2);
	}
	/**
	 * Get the BMI for US units.
	 * @param height height in inches (in)
	 * @param weight weight in pounds (lbs)
	 */
	static calcBMIInLbs(height: number, weight: number): number {
        if (height === 0) return 0;
		return (weight * 703) / (height ** 2);
	}
	/**
	 * Format any kind of number to a localized format.
	 * @param n number
	 * @param decimalPlaces max number of decimal places
	 */
	static formatNumber(n: number, decimalPlaces: number = 1) {
		return new Intl.NumberFormat(this.LOCALE, {
			maximumFractionDigits: decimalPlaces
		}).format(n);
	}
}


type System = "us" | "metric";

const BmiCalculator: React.FC = () => {
    const [system, setSystem] = useState<System>('metric');
    const [height, setHeight] = useState<number>(170); // cm
    const [weight, setWeight] = useState<number>(65); // kg
    const [bmi, setBmi] = useState<number>(0);

    const calcBMI = (h: number, w: number, sys: System): number => {
        if (sys === 'metric') {
            return Utils.calcBMIInKg(w, h);
        } else {
            return Utils.calcBMIInLbs(h, w);
        }
    };
    
    useEffect(() => {
        const result = calcBMI(height, weight, system);
        setBmi(result);
    }, [height, weight, system]);

    const handleSystemChange = (sys: System) => {
        setSystem(sys);
        if (sys === 'metric') {
            // convert freedom units to metric
            setHeight(prev => Math.round(prev * 2.54));
            setWeight(prev => Math.round(prev / 2.205));
        } else {
            // convert metric to freedom units
            setHeight(prev => Math.round(prev / 2.54));
            setWeight(prev => Math.round(prev * 2.205));
        }
    }

    const getBmiCategory = (bmiValue: number) => {
        if (bmiValue <= 0) return "";
        if (bmiValue < 18.5) return "Thiếu cân";
        if (bmiValue < 24.9) return "Bình thường";
        if (bmiValue < 29.9) return "Thừa cân";
        return "Béo phì";
    }

    const category = getBmiCategory(bmi);

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4 border-b pb-4">
                <button 
                    onClick={() => handleSystemChange('metric')}
                    className={`px-4 py-2 rounded-l-md font-semibold ${system === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Hệ mét (cm, kg)
                </button>
                <button 
                    onClick={() => handleSystemChange('us')}
                    className={`px-4 py-2 rounded-r-md font-semibold ${system === 'us' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Hệ đo lường Mỹ (in, lbs)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                        Chiều cao ({system === 'metric' ? 'cm' : 'in'})
                    </label>
                    <input 
                        type="number" 
                        id="height"
                        value={height}
                        onChange={e => setHeight(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                        Cân nặng ({system === 'metric' ? 'kg' : 'lbs'})
                    </label>
                     <input 
                        type="number" 
                        id="weight"
                        value={weight}
                        onChange={e => setWeight(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {bmi > 0 && (
                 <div className="text-center bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-600">Chỉ số BMI của bạn</h3>
                    <p className="text-5xl font-bold text-blue-600 my-2">{Utils.formatNumber(bmi)}</p>
                    <p className={`text-2xl font-semibold 
                        ${category === 'Thiếu cân' ? 'text-yellow-500' : ''}
                        ${category === 'Bình thường' ? 'text-green-500' : ''}
                        ${category === 'Thừa cân' ? 'text-orange-500' : ''}
                        ${category === 'Béo phì' ? 'text-red-500' : ''}
                    `}>
                        {category}
                    </p>
                </div>
            )}
        </div>
    );
};

export default BmiCalculator;
