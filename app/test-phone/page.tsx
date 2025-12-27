"use client";

import { useState } from "react";
import { transformPhoneNumber, formatPhoneForDisplay, getFormatDescription } from "@/lib/utils/phone";
import { SmartPhoneInput } from "@/components/ui/smart-phone-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestPhonePage() {
  const [phoneValue, setPhoneValue] = useState("");
  const [testInput, setTestInput] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);

  const testCases = [
    "09087654322",
    "7098765412",
    "2347098765412",
    "+2347098765412",
    "090-8765-4322",
    "0701 234 5678",
    "8031234567",
    "12345", // invalid
    "5087654322", // invalid prefix
  ];

  const runTests = () => {
    const results = testCases.map(input => ({
      input,
      result: transformPhoneNumber(input)
    }));
    setTestResults(results);
  };

  const testSingleInput = () => {
    if (testInput) {
      const result = transformPhoneNumber(testInput);
      setTestResults([{ input: testInput, result }]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Phone Number Transformation Test</h1>

      {/* Smart Phone Input Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Phone Input Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SmartPhoneInput
            value={phoneValue}
            onChange={setPhoneValue}
            label="Test Phone Input"
            placeholder="Try: 09087654322, 7098765412, +2347098765412"
          />
          <div className="text-sm">
            <strong>Current value:</strong> {phoneValue || "None"}
          </div>
        </CardContent>
      </Card>

      {/* Manual Test */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="test-input">Enter phone number:</Label>
              <Input
                id="test-input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter any phone format"
              />
            </div>
            <Button onClick={testSingleInput} className="mt-6">
              Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Predefined Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Predefined Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} className="mb-4">
            Run All Tests
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Results:</h3>
              {testResults.map((test, index) => (
                <div key={index} className="border rounded p-3 space-y-1">
                  <div><strong>Input:</strong> {test.input}</div>
                  <div><strong>Formatted:</strong> {test.result.formatted}</div>
                  <div><strong>Valid:</strong> {test.result.isValid ? "✅ Yes" : "❌ No"}</div>
                  <div><strong>Format:</strong> {getFormatDescription(test.result.originalFormat)}</div>
                  <div><strong>Country:</strong> {test.result.detectedCountry}</div>
                  {test.result.isValid && (
                    <div><strong>Display:</strong> {formatPhoneForDisplay(test.result.formatted)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}