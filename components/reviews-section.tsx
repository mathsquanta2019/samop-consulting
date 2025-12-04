"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    country: "USA",
    program: "Masters in Computer Science",
    university: "MIT",
    rating: 5,
    text: "SAMOP Consulting made my dream of studying at MIT a reality. Their guidance through every step of the application process was invaluable. I couldn't have done it without their expert team!",
    image: "/professional-woman-headshot.png",
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    country: "Canada",
    program: "MBA",
    university: "University of Toronto",
    rating: 5,
    text: "The team's knowledge of Canadian immigration and education systems is exceptional. They helped me secure admission and navigate the visa process seamlessly.",
    image: "/professional-man-headshot.png",
  },
  {
    id: 3,
    name: "Maria Garcia",
    country: "UK",
    program: "PhD in Biotechnology",
    university: "Oxford University",
    rating: 5,
    text: "From document preparation to interview coaching, SAMOP was with me every step. Their attention to detail and personalized approach made all the difference.",
    image: "/professional-latina-woman-headshot.png",
  },
  {
    id: 4,
    name: "Chen Wei",
    country: "Australia",
    program: "Bachelor in Engineering",
    university: "University of Melbourne",
    rating: 5,
    text: "I was overwhelmed by the application process until I found SAMOP. Their consultants understood my goals and crafted a perfect strategy for my success.",
    image: "/young-asian-man-headshot.png",
  },
  {
    id: 5,
    name: "Priya Sharma",
    country: "Germany",
    program: "Masters in Data Science",
    university: "Technical University of Munich",
    rating: 5,
    text: "The scholarship guidance alone was worth it! SAMOP helped me secure funding that I didn't even know existed. Highly recommended for anyone looking to study abroad.",
    image: "/indian-woman-professional-headshot.png",
  },
  {
    id: 6,
    name: "James Okonkwo",
    country: "USA",
    program: "Medical School",
    university: "Johns Hopkins",
    rating: 5,
    text: "Getting into medical school in the US seemed impossible, but SAMOP made it happen. Their expertise in healthcare education pathways is unmatched.",
    image: "/african-man-doctor-headshot.jpg",
  },
]

// Duplicate for seamless loop
const allReviews = [...reviews, ...reviews]

export function ReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPos = 0
    const scrollSpeed = 0.5

    const animate = () => {
      scrollPos += scrollSpeed

      // Reset when we've scrolled through half (the original set)
      if (scrollPos >= scrollContainer.scrollWidth / 2) {
        scrollPos = 0
      }

      scrollContainer.scrollLeft = scrollPos
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId)
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate)
    }

    scrollContainer.addEventListener("mouseenter", handleMouseEnter)
    scrollContainer.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter)
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <section className="py-20 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Success Stories from Our Clients</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of students who have achieved their dreams of studying abroad with our expert guidance.
          </p>
        </div>
      </div>

      {/* Scrolling Reviews */}
      <div ref={scrollRef} className="flex gap-6 overflow-hidden px-4" style={{ scrollBehavior: "auto" }}>
        {allReviews.map((review, index) => (
          <Card
            key={`${review.id}-${index}`}
            className="flex-shrink-0 w-[400px] bg-card border-border hover:shadow-lg transition-shadow duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={review.image || "/placeholder.svg"}
                  alt={review.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground">{review.name}</h4>
                  <p className="text-sm text-muted-foreground">{review.program}</p>
                  <p className="text-sm text-primary">{review.university}</p>
                </div>
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-primary">{review.country}</span>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">{renderStars(review.rating)}</div>

              <p className="text-muted-foreground text-sm leading-relaxed">"{review.text}"</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
            <p className="text-muted-foreground">Successful Admissions</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <p className="text-muted-foreground">Visa Approval Rate</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <p className="text-muted-foreground">Partner Universities</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
            <p className="text-muted-foreground">Client Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  )
}
