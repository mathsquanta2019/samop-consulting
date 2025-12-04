"use client"

import { useState, useEffect, useMemo } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

const allSteps = {
  service_type: { id: "service_type", title: "Service Type", description: "Choose your service" },
  personal_info: { id: "personal_info", title: "Personal Info", description: "Your details" },
  education: { id: "education", title: "Education", description: "Academic background" },
  experience: { id: "experience", title: "Experience", description: "Work history" },
  test_scores: { id: "test_scores", title: "Test Scores", description: "Language & aptitude" },
  preferences: { id: "preferences", title: "Preferences", description: "Program choices" },
  immigration: { id: "immigration", title: "Immigration Info", description: "Visa & travel details" },
  sevis: { id: "sevis", title: "SEVIS Details", description: "I-20 & DS-2019 info" },
  documents: { id: "documents", title: "Documents", description: "Required uploads" },
  review: { id: "review", title: "Review", description: "Final check" },
}

const stepsByServiceType: Record<ServiceType, string[]> = {
  education: [
    "service_type",
    "personal_info",
    "education",
    "experience",
    "test_scores",
    "preferences",
    "documents",
    "review",
  ],
  immigration: ["service_type", "personal_info", "immigration", "documents", "review"],
  sevis: ["service_type", "personal_info", "education", "sevis", "documents", "review"],
  credential_evaluation: ["service_type", "personal_info", "education", "documents", "review"],
}

const requiredDocumentsByService: Record<ServiceType, DocumentType[]> = {
  education: [
    "passport",
    "transcript",
    "diploma",
    "statement_of_purpose",
    "recommendation_letter",
    "english_proficiency",
    "photo",
  ],
  immigration: ["passport", "photo", "financial_statement", "employment_letter", "police_clearance"],
  sevis: ["passport", "photo", "transcript", "financial_statement"],
  credential_evaluation: ["passport", "transcript", "diploma"],
}

// Additional docs for education levels
const additionalDocsByLevel: Record<EducationLevel, DocumentType[]> = {
  bachelors: [],
  masters: ["cv_resume"],
  phd: ["cv_resume"],
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

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showErrors, setShowErrors] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
    immigrationInfo: {
      purposeOfTravel: "",
      previousVisaRejections: false,
      rejectionDetails: "",
      travelHistory: "",
      sponsor: "self",
      sponsorDetails: "",
    },
    requiredDocuments: [],
  })

  const currentSteps = useMemo(() => {
    const stepIds = stepsByServiceType[formData.serviceType || "education"]
    return stepIds.map((id, index) => ({
      ...allSteps[id as keyof typeof allSteps],
      stepNumber: index + 1,
    }))
  }, [formData.serviceType])

  const currentStep = currentSteps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / currentSteps.length) * 100

  useEffect(() => {
    const serviceType = formData.serviceType || "education"
    let requiredDocs = [...requiredDocumentsByService[serviceType]]

    if (serviceType === "education" && formData.educationLevel) {
      requiredDocs = [...requiredDocs, ...additionalDocsByLevel[formData.educationLevel]]
    }

    // Remove duplicates
    requiredDocs = [...new Set(requiredDocs)]

    setFormData((prev) => ({
      ...prev,
      requiredDocuments: requiredDocs.map((type) => ({
        type,
        required: true,
        uploaded: false,
      })),
    }))
  }, [formData.serviceType, formData.educationLevel])

  // Validation functions
  const validateServiceType = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    if (!formData.serviceType) {
      stepErrors.serviceType = "Please select a service type"
    }
    if (formData.serviceType === "education" && !formData.educationLevel) {
      stepErrors.educationLevel = "Please select an education level"
    }
    return stepErrors
  }

  const validatePersonalInfo = (): Record<string, string> => {
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

  const validateEducation = (): Record<string, string> => {
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

  const validateExperience = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    // Work experience required for Masters/PhD
    if (formData.educationLevel !== "bachelors" && (!formData.workExperience || formData.workExperience.length === 0)) {
      stepErrors.workExperience = "Work experience is recommended for Masters/PhD applications"
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

  const validateTestScores = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    formData.testScores?.forEach((test, index) => {
      if (!test.overallScore?.trim())
        stepErrors[`test_${index}_score`] = `Test #${index + 1}: Overall score is required`
      if (!test.datesTaken) stepErrors[`test_${index}_date`] = `Test #${index + 1}: Test date is required`
    })
    return stepErrors
  }

  const validatePreferences = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    if (!formData.preferredCountries || formData.preferredCountries.length === 0) {
      stepErrors.preferredCountries = "Please select at least one preferred country"
    }
    if (!formData.intakePreference) {
      stepErrors.intakePreference = "Please select a preferred intake"
    }
    return stepErrors
  }

  const validateImmigration = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    const info = formData.immigrationInfo
    if (!info?.purposeOfTravel?.trim()) {
      stepErrors.purposeOfTravel = "Purpose of travel is required"
    }
    if (!info?.sponsor) {
      stepErrors.sponsor = "Please select who will sponsor your trip"
    }
    if (info?.previousVisaRejections && !info?.rejectionDetails?.trim()) {
      stepErrors.rejectionDetails = "Please provide details about previous visa rejections"
    }
    return stepErrors
  }

  const validateSevis = (): Record<string, string> => {
    const stepErrors: Record<string, string> = {}
    // SEVIS step validation - basic for now
    return stepErrors
  }

  const validateDocuments = (): Record<string, string> => {
    return {}
  }

  const validateCurrentStep = (): boolean => {
    let stepErrors: Record<string, string> = {}

    switch (currentStep?.id) {
      case "service_type":
        stepErrors = validateServiceType()
        break
      case "personal_info":
        stepErrors = validatePersonalInfo()
        break
      case "education":
        stepErrors = validateEducation()
        break
      case "experience":
        stepErrors = validateExperience()
        break
      case "test_scores":
        stepErrors = validateTestScores()
        break
      case "preferences":
        stepErrors = validatePreferences()
        break
      case "immigration":
        stepErrors = validateImmigration()
        break
      case "sevis":
        stepErrors = validateSevis()
        break
      case "documents":
        stepErrors = validateDocuments()
        break
      case "review":
        // Validate all applicable steps
        stepErrors = {
          ...validateServiceType(),
          ...validatePersonalInfo(),
          ...(currentSteps.some((s) => s.id === "education") ? validateEducation() : {}),
          ...(currentSteps.some((s) => s.id === "experience") ? validateExperience() : {}),
          ...(currentSteps.some((s) => s.id === "preferences") ? validatePreferences() : {}),
          ...(currentSteps.some((s) => s.id === "immigration") ? validateImmigration() : {}),
        }
        break
    }

    setErrors(stepErrors)
    setShowErrors(true)
    return Object.keys(stepErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setShowErrors(false)
      setCurrentStepIndex((prev) => Math.min(currentSteps.length - 1, prev + 1))
    }
  }

  const handlePrevStep = () => {
    setShowErrors(false)
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }

  useEffect(() => {
    if (formId) {
      loadForm(formId)
    }
  }, [formId])

  const loadForm = async (id: string) => {
    setIsLoading(true)
    const result = await getApplicationFormById(id)
    if (result.success && result.data) {
      setFormData(result.data)
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    // Validate current step before saving
    const stepErrors = validateCurrentStepErrors()
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      setSaveError("Please fix the errors before saving")
      setTimeout(() => setSaveError(null), 3000)
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      if (formData.id) {
        const result = await updateApplicationForm(formData.id, formData)
        if (result.success) {
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        } else {
          setSaveError(result.error || "Failed to save draft")
          setTimeout(() => setSaveError(null), 3000)
        }
      } else {
        const result = await createApplicationForm({
          ...formData,
          clientId: user?.id,
        })
        if (result.success && result.data) {
          setFormData(result.data)
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        } else {
          setSaveError(result.error || "Failed to save draft")
          setTimeout(() => setSaveError(null), 3000)
        }
      }
    } catch (error) {
      setSaveError("An error occurred while saving")
      setTimeout(() => setSaveError(null), 3000)
    }

    setIsSaving(false)
  }

  const validateCurrentStepErrors = (): Record<string, string> => {
    switch (currentStep?.id) {
      case "service_type":
        return validateServiceType()
      case "personal_info":
        return validatePersonalInfo()
      case "education":
        return validateEducation()
      case "experience":
        return validateExperience()
      case "test_scores":
        return validateTestScores()
      case "preferences":
        return validatePreferences()
      case "immigration":
        return validateImmigration()
      case "sevis":
        return validateSevis()
      case "documents":
        return validateDocuments()
      default:
        return {}
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
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

  const renderStepContent = () => {
    switch (currentStep?.id) {
      case "service_type":
        return renderServiceTypeStep()
      case "personal_info":
        return renderPersonalInfoStep()
      case "education":
        return renderEducationStep()
      case "experience":
        return renderExperienceStep()
      case "test_scores":
        return renderTestScoresStep()
      case "preferences":
        return renderPreferencesStep()
      case "immigration":
        return renderImmigrationStep()
      case "sevis":
        return renderSevisStep()
      case "documents":
        return renderDocumentsStep()
      case "review":
        return renderReviewStep()
      default:
        return null
    }
  }

  // Service Type Step
  const renderServiceTypeStep = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            Service Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.serviceType}
            onValueChange={(v) => {
              setFormData({ ...formData, serviceType: v as ServiceType })
              setCurrentStepIndex(0) // Reset to first step when changing service
            }}
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

      <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
        <h4 className="font-medium text-primary mb-2">Steps for this service:</h4>
        <div className="flex flex-wrap gap-2">
          {currentSteps.map((step, idx) => (
            <Badge key={step.id} variant="outline" className="bg-background">
              {idx + 1}. {step.title}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  // Personal Info Step
  const renderPersonalInfoStep = () => (
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
  )

  // Education Step
  const renderEducationStep = () => (
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
                  Institution <span className="text-red-500">*</span>
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
                <Label>GPA (optional)</Label>
                <Input
                  value={edu.gpa || ""}
                  placeholder="e.g., 3.5/4.0"
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
                    ed.id === edu.id ? { ...ed, graduated: checked as boolean } : ed,
                  )
                  setFormData({ ...formData, educationHistory: updated })
                }}
              />
              <Label htmlFor={`graduated-${edu.id}`}>I have graduated from this institution</Label>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addEducation} className="w-full bg-transparent">
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  )

  // Experience Step
  const renderExperienceStep = () => (
    <div className="space-y-6">
      {formData.educationLevel === "bachelors" && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-700">
            Work experience is optional for Bachelor's applications but can strengthen your profile.
          </p>
        </div>
      )}

      {showErrors && errors.workExperience && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4" />
            {errors.workExperience}
          </p>
        </div>
      )}

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
                  Position <span className="text-red-500">*</span>
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
                      ? { ...w, isCurrent: checked as boolean, endDate: checked ? undefined : w.endDate }
                      : w,
                  )
                  setFormData({ ...formData, workExperience: updated })
                }}
              />
              <Label htmlFor={`current-${work.id}`}>I currently work here</Label>
            </div>

            <div className="space-y-2">
              <Label>Responsibilities</Label>
              <Textarea
                value={work.responsibilities}
                rows={3}
                placeholder="Describe your key responsibilities..."
                onChange={(e) => {
                  const updated = formData.workExperience?.map((w) =>
                    w.id === work.id ? { ...w, responsibilities: e.target.value } : w,
                  )
                  setFormData({ ...formData, workExperience: updated })
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addWorkExperience} className="w-full bg-transparent">
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Work Experience
      </Button>
    </div>
  )

  // Test Scores Step
  const renderTestScoresStep = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-700">
          Add any standardized test scores you have. These are often required for university admissions.
        </p>
      </div>

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
            <div className="grid gap-4 md:grid-cols-2">
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
                    <SelectItem value="gre">GRE</SelectItem>
                    <SelectItem value="gmat">GMAT</SelectItem>
                    <SelectItem value="sat">SAT</SelectItem>
                    <SelectItem value="duolingo">Duolingo English Test</SelectItem>
                    <SelectItem value="pte">PTE Academic</SelectItem>
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
                  placeholder="e.g., 7.5 or 110"
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={test.expiryDate || ""}
                  onChange={(e) => {
                    const updated = formData.testScores?.map((t, i) =>
                      i === index ? { ...t, expiryDate: e.target.value } : t,
                    )
                    setFormData({ ...formData, testScores: updated })
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addTestScore} className="w-full bg-transparent">
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Test Score
      </Button>
    </div>
  )

  // Preferences Step
  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Preferred Countries <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["USA", "UK", "Canada", "Australia", "Germany", "France", "Netherlands", "Ireland"].map((country) => (
            <div key={country} className="flex items-center space-x-2">
              <Checkbox
                id={`country-${country}`}
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
              <Label htmlFor={`country-${country}`} className="text-sm font-normal">
                {country}
              </Label>
            </div>
          ))}
        </div>
        <FieldError field="preferredCountries" />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Preferred Intake <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.intakePreference}
          onValueChange={(v) => setFormData({ ...formData, intakePreference: v })}
        >
          <SelectTrigger className={hasError("intakePreference") ? "border-red-500" : ""}>
            <SelectValue placeholder="Select intake" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fall_2025">Fall 2025</SelectItem>
            <SelectItem value="spring_2026">Spring 2026</SelectItem>
            <SelectItem value="fall_2026">Fall 2026</SelectItem>
            <SelectItem value="spring_2027">Spring 2027</SelectItem>
          </SelectContent>
        </Select>
        <FieldError field="intakePreference" />
      </div>

      <div className="space-y-2">
        <Label>Preferred Programs (optional)</Label>
        <Textarea
          value={formData.preferredPrograms?.join("\n") || ""}
          rows={3}
          placeholder="List your preferred programs, one per line"
          onChange={(e) =>
            setFormData({
              ...formData,
              preferredPrograms: e.target.value.split("\n").filter((p) => p.trim()),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Statement of Purpose (optional)</Label>
        <Textarea
          value={formData.statementOfPurpose || ""}
          rows={6}
          placeholder="Write or paste your statement of purpose here..."
          onChange={(e) => setFormData({ ...formData, statementOfPurpose: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">You can also upload this as a document in the next step.</p>
      </div>
    </div>
  )

  const renderImmigrationStep = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-700">
          Please provide accurate information about your travel and immigration history.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Purpose of Travel <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.immigrationInfo?.purposeOfTravel || ""}
          onValueChange={(v) =>
            setFormData({
              ...formData,
              immigrationInfo: { ...formData.immigrationInfo!, purposeOfTravel: v },
            })
          }
        >
          <SelectTrigger className={hasError("purposeOfTravel") ? "border-red-500" : ""}>
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="work">Work Visa</SelectItem>
            <SelectItem value="study">Student Visa</SelectItem>
            <SelectItem value="tourist">Tourist/Visitor Visa</SelectItem>
            <SelectItem value="business">Business Visa</SelectItem>
            <SelectItem value="family">Family Reunification</SelectItem>
            <SelectItem value="permanent_residency">Permanent Residency</SelectItem>
          </SelectContent>
        </Select>
        <FieldError field="purposeOfTravel" />
      </div>

      <div className="space-y-4">
        <Label>Previous Visa Rejections</Label>
        <RadioGroup
          value={formData.immigrationInfo?.previousVisaRejections ? "yes" : "no"}
          onValueChange={(v) =>
            setFormData({
              ...formData,
              immigrationInfo: {
                ...formData.immigrationInfo!,
                previousVisaRejections: v === "yes",
              },
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="rejection-no" />
            <Label htmlFor="rejection-no" className="font-normal">
              No, I have never been rejected
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="rejection-yes" />
            <Label htmlFor="rejection-yes" className="font-normal">
              Yes, I have been rejected before
            </Label>
          </div>
        </RadioGroup>

        {formData.immigrationInfo?.previousVisaRejections && (
          <div className="space-y-2 ml-6">
            <Label className="flex items-center gap-1">
              Rejection Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.immigrationInfo?.rejectionDetails || ""}
              rows={3}
              placeholder="Please provide details about the rejection(s)..."
              onChange={(e) =>
                setFormData({
                  ...formData,
                  immigrationInfo: { ...formData.immigrationInfo!, rejectionDetails: e.target.value },
                })
              }
              className={hasError("rejectionDetails") ? "border-red-500" : ""}
            />
            <FieldError field="rejectionDetails" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Travel History (optional)</Label>
        <Textarea
          value={formData.immigrationInfo?.travelHistory || ""}
          rows={3}
          placeholder="List countries you have traveled to in the past 5 years..."
          onChange={(e) =>
            setFormData({
              ...formData,
              immigrationInfo: { ...formData.immigrationInfo!, travelHistory: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Who will sponsor your trip? <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.immigrationInfo?.sponsor || ""}
          onValueChange={(v) =>
            setFormData({
              ...formData,
              immigrationInfo: {
                ...formData.immigrationInfo!,
                sponsor: v as "self" | "family" | "scholarship" | "employer",
              },
            })
          }
        >
          <SelectTrigger className={hasError("sponsor") ? "border-red-500" : ""}>
            <SelectValue placeholder="Select sponsor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="self">Self-sponsored</SelectItem>
            <SelectItem value="family">Family Member</SelectItem>
            <SelectItem value="employer">Employer</SelectItem>
            <SelectItem value="scholarship">Scholarship/Grant</SelectItem>
          </SelectContent>
        </Select>
        <FieldError field="sponsor" />
      </div>

      {formData.immigrationInfo?.sponsor && formData.immigrationInfo?.sponsor !== "self" && (
        <div className="space-y-2">
          <Label>Sponsor Details</Label>
          <Textarea
            value={formData.immigrationInfo?.sponsorDetails || ""}
            rows={3}
            placeholder="Provide details about your sponsor..."
            onChange={(e) =>
              setFormData({
                ...formData,
                immigrationInfo: { ...formData.immigrationInfo!, sponsorDetails: e.target.value },
              })
            }
          />
        </div>
      )}
    </div>
  )

  const renderSevisStep = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-700">
          SEVIS registration is required for F-1 and J-1 visa applicants studying in the United States.
        </p>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">What we help you with:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5" />
              <span>SEVIS I-901 fee payment ($350 for F-1, $220 for J-1)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Form I-20 or DS-2019 document verification</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5" />
              <span>DS-160 visa application form guidance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Visa interview preparation</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
        <h4 className="font-medium text-amber-800 mb-2">Important Notes:</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>- You must have an I-20 or DS-2019 from your school before SEVIS registration</li>
          <li>- SEVIS fee must be paid at least 3 days before your visa interview</li>
          <li>- Keep your SEVIS ID number safe - you'll need it throughout your studies</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Label>Additional Notes (optional)</Label>
        <Textarea
          rows={4}
          placeholder="Any specific questions or concerns about the SEVIS process..."
          value={formData.statementOfPurpose || ""}
          onChange={(e) => setFormData({ ...formData, statementOfPurpose: e.target.value })}
        />
      </div>
    </div>
  )

  // Documents Step
  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-700">
          Upload the required documents. You can also upload them later from your applications page.
        </p>
      </div>

      <div className="grid gap-4">
        {formData.requiredDocuments?.map((doc, index) => (
          <div
            key={doc.type}
            className={`flex items-center justify-between p-4 border rounded-lg ${
              doc.uploaded ? "bg-green-50 border-green-200" : "bg-background"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileTextIcon className={`h-5 w-5 ${doc.uploaded ? "text-green-600" : "text-muted-foreground"}`} />
              <div>
                <p className="font-medium">{documentTypeLabels[doc.type]}</p>
                <p className="text-sm text-muted-foreground">{doc.required ? "Required" : "Optional"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.uploaded ? (
                <Badge className="bg-green-100 text-green-700">Uploaded</Badge>
              ) : (
                <Button variant="outline" size="sm">
                  Upload
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Note: You can complete document uploads after submitting your application.
      </p>
    </div>
  )

  // Review Step
  const renderReviewStep = () => (
    <div className="space-y-6">
      {showErrors && Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h4 className="font-medium text-red-800 mb-2">Please fix the following errors before submitting:</h4>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            {Object.values(errors)
              .slice(0, 5)
              .map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            {Object.keys(errors).length > 5 && <li>...and {Object.keys(errors).length - 5} more errors</li>}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Service Type</p>
              <p className="font-medium capitalize">{formData.serviceType?.replace("_", " ")}</p>
            </div>
            {formData.serviceType === "education" && (
              <div>
                <p className="text-sm text-muted-foreground">Education Level</p>
                <p className="font-medium capitalize">{formData.educationLevel}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Personal Information</h4>
            <div className="grid gap-2 md:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name: </span>
                {formData.personalInfo?.firstName} {formData.personalInfo?.lastName}
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                {formData.personalInfo?.email}
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                {formData.personalInfo?.phone}
              </div>
              <div>
                <span className="text-muted-foreground">Nationality: </span>
                {formData.personalInfo?.nationality}
              </div>
            </div>
          </div>

          {currentSteps.some((s) => s.id === "education") &&
            formData.educationHistory &&
            formData.educationHistory.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Education ({formData.educationHistory.length})</h4>
                {formData.educationHistory.map((edu, i) => (
                  <p key={i} className="text-sm">
                    {edu.level} in {edu.fieldOfStudy} - {edu.institution}
                  </p>
                ))}
              </div>
            )}

          {currentSteps.some((s) => s.id === "preferences") && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Preferences</h4>
              <div className="text-sm">
                <p>
                  <span className="text-muted-foreground">Countries: </span>
                  {formData.preferredCountries?.join(", ") || "Not specified"}
                </p>
                <p>
                  <span className="text-muted-foreground">Intake: </span>
                  {formData.intakePreference || "Not specified"}
                </p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Documents</h4>
            <div className="flex flex-wrap gap-2">
              {formData.requiredDocuments?.map((doc) => (
                <Badge
                  key={doc.type}
                  variant={doc.uploaded ? "default" : "outline"}
                  className={doc.uploaded ? "bg-green-100 text-green-700" : ""}
                >
                  {documentTypeLabels[doc.type]}
                  {doc.uploaded && " ✓"}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Application</h1>
        <p className="text-muted-foreground">Complete the form to start your application process.</p>
      </div>

      {/* Progress Bar */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Step {currentStepIndex + 1} of {currentSteps.length}
              </span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="hidden md:flex justify-between">
            {currentSteps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  idx === currentStepIndex
                    ? "text-primary"
                    : idx < currentStepIndex
                      ? "text-green-600"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                    idx === currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : idx < currentStepIndex
                        ? "bg-green-100 text-green-600"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx < currentStepIndex ? <CheckCircleIcon className="h-4 w-4" /> : idx + 1}
                </div>
                <span className="text-xs">{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">{currentStep?.title}</CardTitle>
          <CardDescription>{currentStep?.description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevStep} disabled={currentStepIndex === 0}>
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2 items-center">
          {saveSuccess && (
            <span className="text-green-600 text-sm flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4" />
              Draft saved!
            </span>
          )}
          {saveError && (
            <span className="text-red-600 text-sm flex items-center gap-1">
              <AlertCircleIcon className="h-4 w-4" />
              {saveError}
            </span>
          )}
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>

          {currentStepIndex < currentSteps.length - 1 ? (
            <Button onClick={handleNextStep}>
              Next
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              <SendIcon className="h-4 w-4 mr-2" />
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
