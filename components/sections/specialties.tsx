"use client"

import { Bone, Brain, ChevronLeft, ChevronRight, Eye, Heart, Stethoscope, Bluetooth as Tooth } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useTranslations } from "next-intl"

const specialties = [
  {
    id: 1,
    name: "Urology",
    icon: Stethoscope,
    image: "/images/urology-medical-specialist.jpg",
    description: "Expert urological care and treatment",
  },
  {
    id: 2,
    name: "Orthopedic",
    icon: Bone,
    image: "/images/orthopedic-surgeon-with-patient.jpg",
    description: "Bone and joint specialist care",
  },
  {
    id: 3,
    name: "Cardiologist",
    icon: Heart,
    image: "/images/cardiologist-examining-heart.jpg",
    description: "Heart and cardiovascular care",
  },
  {
    id: 4,
    name: "Dentist",
    icon: Tooth,
    image: "/images/dentist-examining-patient-teeth.jpg",
    description: "Complete dental care services",
  },
  {
    id: 5,
    name: "Neurology",
    icon: Brain,
    image: "/images/neurologist-brain-specialist.jpg",
    description: "Brain and nervous system care",
  },
  {
    id: 6,
    name: "Ophthalmology",
    icon: Eye,
    image: "/images/eye-doctor-ophthalmologist.jpg",
    description: "Eye care and vision services",
  },
]

export function SpecialtiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 4
  const t = useTranslations('Specialties')

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerView >= specialties.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, specialties.length - itemsPerView) : prev - 1))
  }

  const visibleSpecialties = specialties.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <section className="py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
            <p className="text-muted-foreground max-w-2xl">
              {t('description')}
            </p>
          </div>

          <div className="hidden md:flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentIndex + itemsPerView >= specialties.length}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleSpecialties.map((specialty) => {
            const IconComponent = specialty.icon
            return (
              <Card key={specialty.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer p-0 border-full">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={specialty.image || "/images/placeholder.svg"}
                      alt={specialty.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.log('Error loading image:', specialty.image);
                        e.currentTarget.src = '/images/placeholder.svg';
                      }}
                      onLoad={() => console.log('Image loaded successfully:', specialty.image)}
                    />
                    <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-colors duration-300" />
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-secondary rounded-lg p-3 mb-2 flex items-center gap-2">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <h3 className="text-primary font-semibold text-lg">{t(specialty.name.toLowerCase())}</h3>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden justify-center space-x-2 mt-8">
          <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= specialties.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
