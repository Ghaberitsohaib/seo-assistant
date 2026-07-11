import asyncio
from services.ai_service import generate_seo_analysis, gemini
from services.nlp_service import extract_keywords, analyze_structure

async def main():
    content = "Decouvrez notre application de fitness revolutionnaire concue pour vous aider a atteindre vos objectifs de remise en forme. Suivez vos seances d'entrainement, calculez vos calories et profitez de programmes d'entrainement personnalises crees par des professionnels. Notre application de fitness vous propose egalement des recettes saines et un suivi de votre hydratation au quotidien. Rejoignez la communaute fitness des aujourd'hui."
    keywords = extract_keywords(content)
    structure = analyze_structure(content)
    
    print("Keywords:", keywords)
    print("Structure:", structure)
    
    # Let's call the gemini generate method directly with the prompt first
    keywords_list = [f"{k['keyword']} ({k['density']}%)" for k in keywords[:5]]
    
    prompt = f"""Tu es un expert SEO professionnel. Analyse le contenu suivant et réponds UNIQUEMENT en JSON valide.
    
CONTENU:
{content[:3000]}

MOTS-CLÉS DÉTECTÉS:
{', '.join(keywords_list)}

STRUCTURE:
- Mots: {structure.get('word_count', 0)}
- Paragraphes: {structure.get('paragraph_count', 0)}
- Titres H1/H2/H3: {structure.get('h1_count', 0)}/{structure.get('h2_count', 0)}/{structure.get('h3_count', 0)}

Génère une analyse JSON avec EXACTEMENT cette structure:
{{
    "score": 85,
    "summary": "Résumé de l'analyse",
    "tone": "Le ton global du texte (ex: Informatif, Persuasif, Formel...)",
    "target_audience": "Le public cible estimé",
    "strengths": ["point 1", "point 2"],
    "weaknesses": ["point 1", "point 2"],
    "recommendations": [
        {{"type": "content", "priority": "high", "title": "Titre", "description": "Description", "suggestion": "Action concrète"}}
    ]
}}
"""
    try:
        raw_text = await gemini._generate(prompt)
        print("--- RAW TEXT FROM GEMINI ---")
        print(raw_text)
        print("----------------------------")
        
        cleaned = gemini._clean_json(raw_text)
        print("--- CLEANED TEXT ---")
        print(cleaned)
        print("--------------------")
        
        import json
        parsed = json.loads(cleaned)
        print("SUCCESS! Parsed JSON:")
        print(parsed)
    except Exception as e:
        print("Failed with exception:", e)

if __name__ == "__main__":
    asyncio.run(main())
