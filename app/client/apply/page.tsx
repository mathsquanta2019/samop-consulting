"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileTextIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  SaveIcon,
  SendIcon,
  AlertCircleIcon,
} from "@/components/icons"
import type {
  ApplicationFormData,
  EducationHistory,
  WorkExperience,
  TestScore,
  EducationLevel,
  ServiceType,
  DocumentType,
} from "@/lib/types"
import { createApplicationForm, updateApplicationForm, submitApplicationForm, getApplicationFormById } from "@/lib/api"
import { useClient } from "../layout"

const steps = [
  { id: 1, title: "Service Type", description: "Choose your service" },
  { id: 2, title: "Personal Info", description: "Your details" },
  { id: 3, title: "Education", description: "Academic background" },
  { id: 4, title: "Experience", description: "Work history" },
  { id: 5, title: "Test Scores", description: "Language & aptitude" },
  { id: 6, title: "Preferences", description: "Program choices" },
  { id: 7, title: "Documents", description: "Required uploads" },
  { id: 8, title: "Review", description: "Final check" },
]

const requiredDocumentsByLevel: Record<EducationLevel, DocumentType[]> = {
  bachelors: [
    "passport",
    "transcript",
    "diploma",
    "statement_of_purpose",
    "recommendation_letter",
    "english_proficiency",
    "photo",
  ],
  masters: [
    "passport",
    "transcript",
    "diploma",
    "statement_of_purpose",
    "recommendation_letter",
    "cv_resume",
    "english_proficiency",
    "photo",
  ],
  phd: [
    "passport",
    "transcript",
    "diploma",
    "statement_of_purpose",
    "recommendation_letter",
    "cv_resume",
    "english_proficiency",
    "photo",
  ],
}

const documentTypeLabels: Record<DocumentType, string> = {
  passport: "Passport",
  transcript: "Academic Transcript",
  diploma: "Diploma/Degree Certificate",
  recommendation_letter: "Recommendation Letter",
  statement_of_purpose: "Statement of Purpose",
  cv_resume: "CV/Resume",
  financial_statement: "Financial Statement",
  english_proficiency: "English Proficiency (IELTS/TOEFL)",
  photo: "Passport Photo",
  birth_certificate: "Birth Certificate",
  marriage_certificate: "Marriage Certificate",
  police_clearance: "Police Clearance",
  medical_report: "Medical Report",
  employment_letter: "Employment Letter",
  other: "Other Document",
}

export default function ApplyPage() {
  const searchParams = useSearchParams()
  const formId = searchParams.get("id")
  const { user, profile } = useClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showErrors, setShowErrors] = useState(false)
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({
    serviceType: "education",
    educationLevel: "masters",
    personalInfo: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      middleName: "",
      dateOfBirth: profile?.dateOfBirth || "",
      gender: "male",
      nationality: profile?.nationality || "",
      countryOfResidence: profile?.currentCountry || "",
      address: profile?.address || "",
      city: "",
      state: "",
      postalCode: "",
      phone: profile?.phone || "",
      email: profile?.email || "",
      maritalStatus: "single",
    },
    educationHistory: [],
    workExperience: [],
    testScores: [],
    preferredCountries: [],
    preferredInstitutions: [],
    preferredPrograms: [],
    intakePreference: "",
    statementOfPurpose: "",
    requiredDocuments: [],
  })

  const validateStep1 = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    if (!formData.serviceType) {
      stepErrors.serviceType = "Please select a service type"
    }
    if (formData.serviceType === "education" && !formData.educationLevel) {
      stepErrors.educationLevel = "Please select an education level"
    }
    return stepErrors
  }

  const validateStep2 = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    const info = formData.personalInfo
    if (!info?.firstName?.trim()) stepErrors.firstName = "First name is required"
    if (!info?.lastName?.trim()) stepErrors.lastName = "Last name is required"
    if (!info?.dateOfBirth) stepErrors.dateOfBirth = "Date of birth is required"
    if (!info?.gender) stepErrors.gender = "Gender is required"
    if (!info?.nationality?.trim()) stepErrors.nationality = "Nationality is required"
    if (!info?.countryOfResidence?.trim()) stepErrors.countryOfResidence = "Country of residence is required"
    if (!info?.address?.trim()) stepErrors.address = "Address is required"
    if (!info?.city?.trim()) stepErrors.city = "City is required"
    if (!info?.state?.trim()) stepErrors.state = "State/Province is required"
    if (!info?.phone?.trim()) stepErrors.phone = "Phone number is required"
    if (!info?.email?.trim()) {
      stepErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
      stepErrors.email = "Please enter a valid email address"
    }
    if (!info?.maritalStatus) stepErrors.maritalStatus = "Marital status is required"
    return stepErrors
  }

  const validateStep3 = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    if (!formData.educationHistory || formData.educationHistory.length === 0) {
      stepErrors.educationHistory = "At least one education record is required"
    } else {
      formData.educationHistory.forEach((edu, index) => {
        if (!edu.institution?.trim())
          stepErrors[`edu_${index}_institution`] = `Education #${index + 1}: Institution is required`
        if (!edu.country?.trim()) stepErrors[`edu_${index}_country`] = `Education #${index + 1}: Country is required`
        if (!edu.fieldOfStudy?.trim())
          stepErrors[`edu_${index}_fieldOfStudy`] = `Education #${index + 1}: Field of study is required`
        if (!edu.startDate) stepErrors[`edu_${index}_startDate`] = `Education #${index + 1}: Start date is required`
        if (!edu.endDate) stepErrors[`edu_${index}_endDate`] = `Education #${index + 1}: End date is required`
      })
    }
    return stepErrors
  }

  const validateStep4 = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    // Work experience is optional for bachelors, but required fields if entries exist
    if (formData.educationLevel !== "bachelors" && (!formData.workExperience || formData.workExperience.length === 0)) {
      stepErrors.workExperience = "Work experience is required for Masters/PhD applications"
    }
    formData.workExperience?.forEach((work, index) => {
      if (!work.companyName?.trim())
        stepErrors[`work_${index}_company`] = `Experience #${index + 1}: Company name is required`
      if (!work.position?.trim())
        stepErrors[`work_${index}_position`] = `Experience #${index + 1}: Position is required`
      if (!work.country?.trim()) stepErrors[`work_${index}_country`] = `Experience #${index + 1}: Country is required`
      if (!work.startDate) stepErrors[`work_${index}_startDate`] = `Experience #${index + 1}: Start date is required`
    })
    return stepErrors
  }

  const validateStep5 = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    // Test scores are recommended but not strictly required
    formData.testScores?.forEach((test, index) => {
      if (!test.overallScore?.trim())
        stepErrors[`test_${index}_score`] = `Test #${index + 1}: Overall score is required`
      if (!test.datesTaken) stepErrors[`test_${index}_date`] = `Test #${index + 1}: Test date is required`
    })
    return stepErrors
  }

  const validateStep6 = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    if (!formData.preferredCountries || formData.preferredCountries.length === 0) {
      stepErrors.preferredCountries = "Please select at least one preferred country"
    }
    if (!formData.intakePreference) {
      stepErrors.intakePreference = "Please select a preferred intake"
    }
    return stepErrors
  }

  const validateStep7 = (): Record<string, string> => {
    // Documents step - no strict validation, user can upload later
    return {}
  }

  const validateStep8 = (): Record<string, string> => {
    // Review step - validate all previous steps
    return {
      ...validateStep1(),
      ...validateStep2(),
      ...validateStep3(),
      ...validateStep4(),
      ...validateStep5(),
      ...validateStep6(),
    }
  }

  const validateCurrentStep = (): boolean => {
    let stepErrors: Record<string, string> = {}
    switch (currentStep) {
      case 1:
        stepErrors = validateStep1()
        break
      case 2:
        stepErrors = validateStep2()
        break
      case 3:
        stepErrors = validateStep3()
        break
      case 4:
        stepErrors = validateStep4()
        break
      case 5:
        stepErrors = validateStep5()
        break
      case 6:
        stepErrors = validateStep6()
        break
      case 7:
        stepErrors = validateStep7()
        break
      case 8:
        stepErrors = validateStep8()
        break
    }
    setErrors(stepErrors)
    setShowErrors(true)
    return Object.keys(stepErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setShowErrors(false)
      setCurrentStep((prev) => Math.min(steps.length, prev + 1))
    }
  }

  useEffect(() => {
    if (formId) {
      loadForm(formId)
    }
  }, [formId])

  useEffect(() => {
    if (formData.educationLevel && formData.serviceType === "education") {
      const requiredDocs = requiredDocumentsByLevel[formData.educationLevel] || []
      setFormData((prev) => ({
        ...prev,
        requiredDocuments: requiredDocs.map((type) => ({
          type,
          required: true,
          uploaded: false,
        })),
      }))
    }
  }, [formData.educationLevel, formData.serviceType])

  const loadForm = async (id: string) => {
    setIsLoading(true)
    const result = await getApplicationFormById(id)
    if (result.success && result.data) {
      setFormData(result.data)
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    if (formData.id) {
      await updateApplicationForm(formData.id, formData)
    } else {
      const result = await createApplicationForm({
        ...formData,
        clientId: user?.id,
      })
      if (result.success && result.data) {
        setFormData(result.data)
      }
    }
    setIsSaving(false)
  }

  const handleSubmit = async () => {
    const allErrors = validateStep8()
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      setShowErrors(true)
      return
    }

    if (!formData.id) {
      await handleSave()
    }
    if (formData.id) {
      setIsLoading(true)
      await submitApplicationForm(formData.id)
      setIsLoading(false)
      window.location.href = "/client/applications"
    }
  }

  const addEducation = () => {
    const newEdu: EducationHistory = {
      id: `edu_${Date.now()}`,
      level: "bachelors",
      institution: "",
      country: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      graduated: false,
      certificateObtained: "",
    }
    setFormData((prev) => ({
      ...prev,
      educationHistory: [...(prev.educationHistory || []), newEdu],
    }))
  }

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      educationHistory: prev.educationHistory?.filter((e) => e.id !== id) || [],
    }))
  }

  const addWorkExperience = () => {
    const newWork: WorkExperience = {
      id: `work_${Date.now()}`,
      companyName: "",
      position: "",
      country: "",
      startDate: "",
      isCurrent: false,
      responsibilities: "",
    }
    setFormData((prev) => ({
      ...prev,
      workExperience: [...(prev.workExperience || []), newWork],
    }))
  }

  const removeWorkExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience?.filter((w) => w.id !== id) || [],
    }))
  }

  const addTestScore = () => {
    const newTest: TestScore = {
      testType: "ielts",
      overallScore: "",
      datesTaken: "",
    }
    setFormData((prev) => ({
      ...prev,
      testScores: [...(prev.testScores || []), newTest],
    }))
  }

  const removeTestScore = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      testScores: prev.testScores?.filter((_, i) => i !== index) || [],
    }))
  }

  const progress = (currentStep / steps.length) * 100

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please log in to apply.</p>
      </div>
    )
  }

  const FieldError = ({ field }: { field: string }) => {
    if (!showErrors || !errors[field]) return null
    return (
      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
        <AlertCircleIcon className="h-3 w-3" />
        {errors[field]}
      </p>
    )
  }

  const hasError = (field: string) => showErrors && errors[field]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Application</h1>
        <p className="text-muted-foreground">Complete the form to start your application process.</p>
      </div>

      {showErrors && Object.keys(errors).length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Please fix the following errors:</p>
                <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                  {Object.values(errors)
                    .slice(0, 5)
                    .map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  {Object.keys(errors).length > 5 && <li>...and {Object.keys(errors).length - 5} more errors</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="hidden md:flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                      ? "text-green-600"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                        ? "bg-green-100 text-green-600"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? <CheckCircleIcon className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs">{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Steps */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Service Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(v) => setFormData({ ...formData, serviceType: v as ServiceType })}
                  >
                    <SelectTrigger className={hasError("serviceType") ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">University Admissions</SelectItem>
                      <SelectItem value="immigration">Immigration / Visa</SelectItem>
                      <SelectItem value="sevis">SEVIS Registration</SelectItem>
                      <SelectItem value="credential_evaluation">Credential Evaluation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field="serviceType" />
                </div>

                {formData.serviceType === "education" && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Education Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.educationLevel}
                      onValueChange={(v) => setFormData({ ...formData, educationLevel: v as EducationLevel })}
                    >
                      <SelectTrigger className={hasError("educationLevel") ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD / Doctorate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError field="educationLevel" />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">What's included:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {formData.serviceType === "education" && (
                    <>
                      <li>- University shortlisting and selection guidance</li>
                      <li>- Application document preparation and review</li>
                      <li>- Statement of Purpose (SOP) review</li>
                      <li>- Application submission support</li>
                      <li>- Interview preparation (if required)</li>
                    </>
                  )}
                  {formData.serviceType === "immigration" && (
                    <>
                      <li>- Visa eligibility assessment</li>
                      <li>- Document checklist and preparation</li>
                      <li>- Application form assistance</li>
                      <li>- Interview preparation</li>
                      <li>- Status tracking and updates</li>
                    </>
                  )}
                  {formData.serviceType === "sevis" && (
                    <>
                      <li>- SEVIS I-901 fee payment assistance</li>
                      <li>- DS-160 form guidance</li>
                      <li>- Visa interview preparation</li>
                      <li>- Document review</li>
                    </>
                  )}
                  {formData.serviceType === "credential_evaluation" && (
                    <>
                      <li>- Credential evaluation for US universities</li>
                      <li>- WES/ECE evaluation assistance</li>
                      <li>- Document translation coordination</li>
                      <li>- Transcript verification</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information - with validation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.personalInfo?.firstName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, firstName: e.target.value },
                      })
                    }
                    className={hasError("firstName") ? "border-red-500" : ""}
                  />
                  <FieldError field="firstName" />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input
                    value={formData.personalInfo?.middleName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, middleName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.personalInfo?.lastName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, lastName: e.target.value },
                      })
                    }
                    className={hasError("lastName") ? "border-red-500" : ""}
                  />
                  <FieldError field="lastName" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.personalInfo?.dateOfBirth || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, dateOfBirth: e.target.value },
                      })
                    }
                    className={hasError("dateOfBirth") ? "border-red-500" : ""}
                  />
                  <FieldError field="dateOfBirth" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.personalInfo?.gender}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, gender: v as "male" | "female" | "other" },
                      })
                    }
                  >
                    <SelectTrigger className={hasError("gender") ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field="gender" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Marital Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.personalInfo?.maritalStatus}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        personalInfo: {
                          ...formData.personalInfo!,
                          maritalStatus: v as "single" | "married" | "divorced" | "widowed",
                        },
                      })
                    }
                  >
                    <SelectTrigger className={hasError("maritalStatus") ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field="maritalStatus" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Nationality <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.personalInfo?.nationality || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, nationality: e.target.value },
                      })
                    }
                    className={hasError("nationality") ? "border-red-500" : ""}
                  />
                  <FieldError field="nationality" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Country of Residence <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.personalInfo?.countryOfResidence || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, countryOfResidence: e.target.value },
                      })
                    }
                    className={hasError("countryOfResidence") ? "border-red-500" : ""}
                  />
                  <FieldError field="countryOfResidence" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.personalInfo?.address || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo!, address: e.target.value },
                    })
                  }
                  className={hasError("address") ? "border-red-500" : ""}
                />
                <FieldError field="address" />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.personalInfo?.city || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, city: e.target.value },
                      })
                    }
                    className={hasError("city") ? "border-red-500" : ""}
                  />
                  <FieldError field="city" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    State/Province <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.personalInfo?.state || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, state: e.target.value },
                      })
                    }
                    className={hasError("state") ? "border-red-500" : ""}
                  />
                  <FieldError field="state" />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={formData.personalInfo?.postalCode || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, postalCode: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.personalInfo?.phone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, phone: e.target.value },
                      })
                    }
                    className={hasError("phone") ? "border-red-500" : ""}
                  />
                  <FieldError field="phone" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.personalInfo?.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo!, email: e.target.value },
                      })
                    }
                    className={hasError("email") ? "border-red-500" : ""}
                  />
                  <FieldError field="email" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Education History - with validation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {showErrors && errors.educationHistory && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertCircleIcon className="h-4 w-4" />
                    {errors.educationHistory}
                  </p>
                </div>
              )}

              {formData.educationHistory?.map((edu, index) => (
                <Card key={edu.id} className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Education #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Education Level <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={edu.level}
                          onValueChange={(v) => {
                            const updated = formData.educationHistory?.map((e) =>
                              e.id === edu.id ? { ...e, level: v as EducationHistory["level"] } : e,
                            )
                            setFormData({ ...formData, educationHistory: updated })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high_school">High School</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="certificate">Certificate</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="phd">PhD / Doctorate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Institution Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = formData.educationHistory?.map((ed) =>
                              ed.id === edu.id ? { ...ed, institution: e.target.value } : ed,
                            )
                            setFormData({ ...formData, educationHistory: updated })
                          }}
                          className={hasError(`edu_${index}_institution`) ? "border-red-500" : ""}
                        />
                        <FieldError field={`edu_${index}_institution`} />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={edu.country}
                          onChange={(e) => {
                            const updated = formData.educationHistory?.map((ed) =>
                              ed.id === edu.id ? { ...ed, country: e.target.value } : ed,
                            )
                            setFormData({ ...formData, educationHistory: updated })
                          }}
                          className={hasError(`edu_${index}_country`) ? "border-red-500" : ""}
                        />
                        <FieldError field={`edu_${index}_country`} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Field of Study <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const updated = formData.educationHistory?.map((ed) =>
                              ed.id === edu.id ? { ...ed, fieldOfStudy: e.target.value } : ed,
                            )
                            setFormData({ ...formData, educationHistory: updated })
                          }}
                          className={hasError(`edu_${index}_fieldOfStudy`) ? "border-red-500" : ""}
                        />
                        <FieldError field={`edu_${index}_fieldOfStudy`} />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => {
                            const updated = formData.educationHistory?.map((ed) =>
                              ed.id === edu.id ? { ...ed, startDate: e.target.value } : ed,
                            )
                            setFormData({ ...formData, educationHistory: updated })
                          }}
                          className={hasError(`edu_${index}_startDate`) ? "border-red-500" : ""}
                        />
                        <FieldError field={`edu_${index}_startDate`} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          End Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => {
                            const updated = formData.educationHistory?.map((ed) =>
                              ed.id === edu.id ? { ...ed, endDate: e.target.value } : ed,
                            )
                            setFormData({ ...formData, educationHistory: updated })
                          }}
                          className={hasError(`edu_${index}_endDate`) ? "border-red-500" : ""}
                        />
                        <FieldError field={`edu_${index}_endDate`} />
                      </div>
                      <div className="space-y-2">
                        <Label>GPA/Grade</Label>
                        <Input
                          value={edu.gpa || ""}
                          onChange={(e) => {
                            const updated = formData.educationHistory?.map((ed) =>
                              ed.id === edu.id ? { ...ed, gpa: e.target.value } : ed,
                            )
                            setFormData({ ...formData, educationHistory: updated })
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`graduated-${edu.id}`}
                        checked={edu.graduated}
                        onCheckedChange={(checked) => {
                          const updated = formData.educationHistory?.map((ed) =>
                            ed.id === edu.id ? { ...ed, graduated: !!checked } : ed,
                          )
                          setFormData({ ...formData, educationHistory: updated })
                        }}
                      />
                      <label htmlFor={`graduated-${edu.id}`} className="text-sm">
                        Graduated
                      </label>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addEducation} className="w-full bg-transparent">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Education
              </Button>

              {(formData.educationHistory?.length || 0) === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No education records added yet. Click the button above to add your educational background.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Work Experience - with validation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {showErrors && errors.workExperience && formData.educationLevel !== "bachelors" && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertCircleIcon className="h-4 w-4" />
                    {errors.workExperience}
                  </p>
                </div>
              )}

              {formData.educationLevel === "bachelors" ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Work experience is optional for Bachelor's degree applications.
                  </p>
                  <Button variant="outline" onClick={addWorkExperience} className="mt-4 bg-transparent">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Work Experience (Optional)
                  </Button>
                </div>
              ) : (
                <>
                  {formData.workExperience?.map((work, index) => (
                    <Card key={work.id} className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Experience #{index + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeWorkExperience(work.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              Company Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={work.companyName}
                              onChange={(e) => {
                                const updated = formData.workExperience?.map((w) =>
                                  w.id === work.id ? { ...w, companyName: e.target.value } : w,
                                )
                                setFormData({ ...formData, workExperience: updated })
                              }}
                              className={hasError(`work_${index}_company`) ? "border-red-500" : ""}
                            />
                            <FieldError field={`work_${index}_company`} />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              Position/Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={work.position}
                              onChange={(e) => {
                                const updated = formData.workExperience?.map((w) =>
                                  w.id === work.id ? { ...w, position: e.target.value } : w,
                                )
                                setFormData({ ...formData, workExperience: updated })
                              }}
                              className={hasError(`work_${index}_position`) ? "border-red-500" : ""}
                            />
                            <FieldError field={`work_${index}_position`} />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              Country <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={work.country}
                              onChange={(e) => {
                                const updated = formData.workExperience?.map((w) =>
                                  w.id === work.id ? { ...w, country: e.target.value } : w,
                                )
                                setFormData({ ...formData, workExperience: updated })
                              }}
                              className={hasError(`work_${index}_country`) ? "border-red-500" : ""}
                            />
                            <FieldError field={`work_${index}_country`} />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              Start Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="date"
                              value={work.startDate}
                              onChange={(e) => {
                                const updated = formData.workExperience?.map((w) =>
                                  w.id === work.id ? { ...w, startDate: e.target.value } : w,
                                )
                                setFormData({ ...formData, workExperience: updated })
                              }}
                              className={hasError(`work_${index}_startDate`) ? "border-red-500" : ""}
                            />
                            <FieldError field={`work_${index}_startDate`} />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={work.endDate || ""}
                              disabled={work.isCurrent}
                              onChange={(e) => {
                                const updated = formData.workExperience?.map((w) =>
                                  w.id === work.id ? { ...w, endDate: e.target.value } : w,
                                )
                                setFormData({ ...formData, workExperience: updated })
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`current-${work.id}`}
                            checked={work.isCurrent}
                            onCheckedChange={(checked) => {
                              const updated = formData.workExperience?.map((w) =>
                                w.id === work.id
                                  ? { ...w, isCurrent: !!checked, endDate: checked ? undefined : w.endDate }
                                  : w,
                              )
                              setFormData({ ...formData, workExperience: updated })
                            }}
                          />
                          <label htmlFor={`current-${work.id}`} className="text-sm">
                            Currently working here
                          </label>
                        </div>
                        <div className="space-y-2">
                          <Label>Key Responsibilities</Label>
                          <Textarea
                            value={work.responsibilities}
                            onChange={(e) => {
                              const updated = formData.workExperience?.map((w) =>
                                w.id === work.id ? { ...w, responsibilities: e.target.value } : w,
                              )
                              setFormData({ ...formData, workExperience: updated })
                            }}
                            placeholder="Describe your main duties and achievements..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button variant="outline" onClick={addWorkExperience} className="w-full bg-transparent">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Work Experience
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Step 5: Test Scores - with validation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {formData.testScores?.map((test, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Test Score #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeTestScore(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Test Type</Label>
                        <Select
                          value={test.testType}
                          onValueChange={(v) => {
                            const updated = formData.testScores?.map((t, i) =>
                              i === index ? { ...t, testType: v as TestScore["testType"] } : t,
                            )
                            setFormData({ ...formData, testScores: updated })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ielts">IELTS</SelectItem>
                            <SelectItem value="toefl">TOEFL</SelectItem>
                            <SelectItem value="pte">PTE Academic</SelectItem>
                            <SelectItem value="duolingo">Duolingo English Test</SelectItem>
                            <SelectItem value="gre">GRE</SelectItem>
                            <SelectItem value="gmat">GMAT</SelectItem>
                            <SelectItem value="sat">SAT</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Overall Score <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={test.overallScore}
                          onChange={(e) => {
                            const updated = formData.testScores?.map((t, i) =>
                              i === index ? { ...t, overallScore: e.target.value } : t,
                            )
                            setFormData({ ...formData, testScores: updated })
                          }}
                          className={hasError(`test_${index}_score`) ? "border-red-500" : ""}
                        />
                        <FieldError field={`test_${index}_score`} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          Date Taken <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={test.datesTaken}
                          onChange={(e) => {
                            const updated = formData.testScores?.map((t, i) =>
                              i === index ? { ...t, datesTaken: e.target.value } : t,
                            )
                            setFormData({ ...formData, testScores: updated })
                          }}
                          className={hasError(`test_${index}_date`) ? "border-red-500" : ""}
                        />
                        <FieldError field={`test_${index}_date`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addTestScore} className="w-full bg-transparent">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Test Score
              </Button>

              {(formData.testScores?.length || 0) === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Add your language proficiency and standardized test scores (IELTS, TOEFL, GRE, GMAT, etc.)
                </p>
              )}
            </div>
          )}

          {/* Step 6: Program Preferences - with validation */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Preferred Countries <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["USA", "UK", "Canada", "Australia", "Germany", "France", "Netherlands", "Ireland"].map(
                    (country) => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox
                          id={country}
                          checked={formData.preferredCountries?.includes(country)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                preferredCountries: [...(formData.preferredCountries || []), country],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                preferredCountries: formData.preferredCountries?.filter((c) => c !== country),
                              })
                            }
                          }}
                        />
                        <label htmlFor={country} className="text-sm cursor-pointer">
                          {country}
                        </label>
                      </div>
                    ),
                  )}
                </div>
                <FieldError field="preferredCountries" />
              </div>

              <div className="space-y-2">
                <Label>Preferred Institutions (comma-separated)</Label>
                <Textarea
                  value={formData.preferredInstitutions?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredInstitutions: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g., MIT, Stanford, Harvard, Oxford"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Programs/Fields (comma-separated)</Label>
                <Textarea
                  value={formData.preferredPrograms?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredPrograms: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g., Computer Science, Data Science, MBA"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Preferred Intake <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.intakePreference || ""}
                  onValueChange={(v) => setFormData({ ...formData, intakePreference: v })}
                >
                  <SelectTrigger className={hasError("intakePreference") ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select intake" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                    <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                    <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError field="intakePreference" />
              </div>

              <div className="space-y-2">
                <Label>Statement of Purpose (Draft)</Label>
                <Textarea
                  value={formData.statementOfPurpose || ""}
                  onChange={(e) => setFormData({ ...formData, statementOfPurpose: e.target.value })}
                  placeholder="Write your statement of purpose here. Our team will review and provide feedback..."
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  This is optional at this stage. You can upload a complete SOP in the documents section.
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Documents Checklist */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                The following documents are required for your application. You can upload them now or later from your
                dashboard.
              </p>

              <div className="space-y-3">
                {formData.requiredDocuments?.map((doc, index) => (
                  <div
                    key={doc.type}
                    className={`p-4 rounded-lg border ${
                      doc.uploaded ? "border-green-200 bg-green-50" : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileTextIcon
                          className={`h-5 w-5 ${doc.uploaded ? "text-green-600" : "text-muted-foreground"}`}
                        />
                        <div>
                          <p className="font-medium">{documentTypeLabels[doc.type]}</p>
                          <p className="text-xs text-muted-foreground">{doc.required ? "Required" : "Optional"}</p>
                        </div>
                      </div>
                      {doc.uploaded ? (
                        <Badge className="bg-green-100 text-green-700">Uploaded</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                You can upload documents after submitting this form from the Documents section in your dashboard.
              </p>
            </div>
          )}

          {/* Step 8: Review */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Service Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Service Type</p>
                        <p className="font-medium capitalize">{formData.serviceType}</p>
                      </div>
                      {formData.educationLevel && (
                        <div>
                          <p className="text-muted-foreground">Education Level</p>
                          <p className="font-medium capitalize">{formData.educationLevel}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Full Name</p>
                        <p className="font-medium">
                          {formData.personalInfo?.firstName} {formData.personalInfo?.middleName}{" "}
                          {formData.personalInfo?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{formData.personalInfo?.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{formData.personalInfo?.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Nationality</p>
                        <p className="font-medium">{formData.personalInfo?.nationality}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Education & Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p>
                        <span className="text-muted-foreground">Education Records:</span>{" "}
                        <span className="font-medium">{formData.educationHistory?.length || 0}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Work Experience:</span>{" "}
                        <span className="font-medium">{formData.workExperience?.length || 0}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Test Scores:</span>{" "}
                        <span className="font-medium">{formData.testScores?.length || 0}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p>
                        <span className="text-muted-foreground">Preferred Countries:</span>{" "}
                        <span className="font-medium">
                          {formData.preferredCountries?.join(", ") || "Not specified"}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Preferred Intake:</span>{" "}
                        <span className="font-medium">{formData.intakePreference || "Not specified"}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Documents Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm">
                      <p>
                        <span className="text-muted-foreground">Uploaded:</span>{" "}
                        <span className="font-medium text-green-600">
                          {formData.requiredDocuments?.filter((d) => d.uploaded).length || 0}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Pending:</span>{" "}
                        <span className="font-medium text-orange-600">
                          {formData.requiredDocuments?.filter((d) => !d.uploaded).length || 0}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm">
                  By submitting this application, you confirm that all information provided is accurate and complete.
                  Our team will review your application and contact you within 2-3 business days.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons - with validation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setShowErrors(false)
            setCurrentStep((prev) => Math.max(1, prev - 1))
          }}
          disabled={currentStep === 1}
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <SaveIcon className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNextStep}>
              Next
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary text-primary-foreground">
              <SendIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
