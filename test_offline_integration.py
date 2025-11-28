#!/usr/bin/env python3
"""
FinSphere Offline Integration Test
Tests Ollama + Qdrant integration locally
"""

import asyncio
import json
from pathlib import Path
import sys

# Add the backend directory to the path
backend_path = Path(__file__).parent / "finsphere-backend"
sys.path.insert(0, str(backend_path))

from app.services.vector_db import vector_service
from app.services.ollama_service import ollama_service
from app.services.rag_service import rag_service


async def test_ollama():
    """Test Ollama connectivity and model availability."""
    print("🤖 Testing Ollama...")
    
    # Test basic connectivity
    available = ollama_service.is_available()
    print(f"   Available: {available}")
    
    if available:
        # Test embedding generation
        embedding = ollama_service.generate_embedding("Test financial stress message")
        print(f"   Embedding dimension: {len(embedding)}")
        
        # Test chat functionality
        messages = [
            {"role": "user", "content": "Hello, are you working?"}
        ]
        response = ollama_service.chat(messages, temperature=0.1)
        print(f"   Chat response: {response[:100]}...")
        
        return True
    return False


async def test_qdrant():
    """Test Qdrant connectivity and operations."""
    print("🔍 Testing Qdrant...")
    
    # Test collection info
    info = vector_service.get_collection_info()
    print(f"   Status: {info.get('status')}")
    print(f"   Collection: {info.get('collection_name')}")
    
    if info.get('status') == 'active':
        # Test upserting an event
        await vector_service.upsert_event(
            event_id="test_event_001",
            text_description="High stress detected: HR 120bpm, buying on Amazon",
            metadata={
                "user_id": "test_user",
                "type": "biometric",
                "timestamp": "2025-11-29T10:00:00Z",
                "stress_score": 0.8
            }
        )
        print("   ✅ Upserted test event")
        
        # Test querying similar events
        results = await vector_service.query_similar_events(
            user_id="test_user",
            query_text="stress shopping behavior",
            top_k=3
        )
        print(f"   Found {len(results)} similar events")
        
        return True
    return False


async def test_rag():
    """Test RAG (Retrieval-Augmented Generation) functionality."""
    print("🧠 Testing RAG Integration...")
    
    # Test intervention generation
    intervention = await rag_service.generate_intervention(
        user_id="test_user",
        context_url="https://amazon.in/electronics"
    )
    
    print(f"   Intervention decision: {intervention}")
    
    # Test therapy response
    therapy_response = await rag_service.generate_therapy_response(
        user_id="test_user",
        user_message="I'm stressed about money and keep buying things online"
    )
    
    print(f"   Therapy response: {therapy_response[:100]}...")
    
    return intervention.get('should_intervene') is not None


async def run_integration_test():
    """Run complete integration test."""
    print("🚀 FinSphere Offline Integration Test")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Ollama
    if await test_ollama():
        tests_passed += 1
        print("   ✅ Ollama test passed\n")
    else:
        print("   ❌ Ollama test failed\n")
    
    # Test 2: Qdrant
    if await test_qdrant():
        tests_passed += 1
        print("   ✅ Qdrant test passed\n")
    else:
        print("   ❌ Qdrant test failed\n")
    
    # Test 3: RAG Integration
    if await test_rag():
        tests_passed += 1
        print("   ✅ RAG integration test passed\n")
    else:
        print("   ❌ RAG integration test failed\n")
    
    # Summary
    print("=" * 50)
    print(f"🎯 Integration Test Results: {tests_passed}/{total_tests} passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! FinSphere offline system is ready!")
        print("\nNext steps:")
        print("1. Start the backend: cd finsphere-backend && python main.py")
        print("2. Start the frontend: cd finsphere-frontend && npm run dev")
        print("3. Load the Chrome extension")
    else:
        print("⚠️  Some tests failed. Check the setup:")
        print("1. Ensure Ollama is running: ollama list")
        print("2. Ensure Qdrant is running: curl http://localhost:6333")
        print("3. Check model availability: ollama pull gpt-oss:20b")


if __name__ == "__main__":
    asyncio.run(run_integration_test())