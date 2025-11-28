from textblob import TextBlob
from typing import Tuple

class AnalyzerService:
    
    @staticmethod
    def analyze_sentiment(text: str) -> Tuple[float, str]:
        """
        Analyze text sentiment using TextBlob.
        Returns (polarity_score, label)
        """
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity # -1.0 to 1.0
        
        if polarity > 0.1:
            return polarity, "positive"
        elif polarity < -0.1:
            return polarity, "negative"
        else:
            return polarity, "neutral"

    @staticmethod
    def assess_stress(hr: int, hrv: float) -> Tuple[bool, float]:
        """
        Rule-based stress assessment.
        Returns (is_stressed, stress_score)
        """
        # Simple heuristic: High HR (>90) + Low HRV (<30ms) = High Stress
        # This is a simplification. Real models would use baselines.
        
        score = 0.0
        is_stressed = False
        
        # Normalize HR (assuming 60-100 resting range for simplicity)
        hr_score = max(0, min(1, (hr - 60) / 40))
        
        # Normalize HRV (assuming 20-100 range, lower is worse)
        # Invert so high score = bad
        hrv_score = max(0, min(1, (100 - hrv) / 80))
        
        # Combined stress score
        score = (hr_score * 0.4) + (hrv_score * 0.6)
        
        if hr > 90 and hrv < 35:
            is_stressed = True
            score = max(score, 0.8) # Force high score
            
        return is_stressed, score

analyzer = AnalyzerService()
