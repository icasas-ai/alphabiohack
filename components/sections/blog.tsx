"use client"

import { Calendar, ChevronLeft, ChevronRight, User } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type LandingPageResolvedSimpleSection } from "@/lib/company/landing-page-config"
import { useState } from "react"
import { useTranslations } from "next-intl"

const blogPosts = [
  {
    id: 1,
    title: "Revolutionizing Healthcare: The Rise of Telemedicine",
    excerpt: "Explore how online doctor booking is revolutionizing access to healthcare services...",
    category: "Urology",
    author: "Dr. Smith",
    date: "03 Apr 2025",
    image: "/images/doctor-using-telemedicine-technology.jpg",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Neurology and Technology: A New Era of Brain Care",
    excerpt: "Discover the intersection of technology and neurology, revolutionizing brain care...",
    category: "Neurology",
    author: "Dr. Johnson",
    date: "10 Apr 2025",
    image: "/images/brain-scan-neurology-technology.jpg",
    readTime: "7 min read",
  },
  {
    id: 3,
    title: "Beating Strong: The Digital Revolution in Cardiac Care",
    excerpt: "Discover how digital advancements are transforming cardiac care and treatment...",
    category: "Orthopedic",
    author: "Dr. Williams",
    date: "15 Apr 2025",
    image: "/images/cardiac-care-heart-monitor.jpg",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Understanding and Preventing Glaucoma: A Comprehensive Guide",
    excerpt: "Glaucoma is a leading cause of blindness worldwide, yet many people don't know...",
    category: "Ophthalmology",
    author: "Dr. Davis",
    date: "18 Apr 2025",
    image: "/images/eye-examination-glaucoma-prevention.jpg",
    readTime: "8 min read",
  },
]

export function BlogSection({
  content = null,
}: {
  content?: LandingPageResolvedSimpleSection | null
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 4
  const t = useTranslations('Blog')
  const publicCardRadiusClass = "rounded-[24px]"
  const sectionTitle = content?.title || t("title")
  const sectionSubtitle = content?.description || t("subtitle")

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerView >= blogPosts.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, blogPosts.length - itemsPerView) : prev - 1))
  }

  const visiblePosts = blogPosts.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <section id="home-blog" className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{sectionTitle}</h2>
            <p className="text-muted-foreground">{sectionSubtitle}</p>
          </div>

          <div className="hidden md:flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentIndex + itemsPerView >= blogPosts.length}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visiblePosts.map((post) => (
            <Card key={post.id} className={`group cursor-pointer p-0 transition-all duration-300 hover:shadow-lg ${publicCardRadiusClass}`}>
              <CardContent className="p-0">
                <div className={`relative overflow-hidden rounded-t-[24px]`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {post.date}
                      </div>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  {t('readMore')}
                </Button>
              </CardFooter>
            </Card>
          ))}
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
            disabled={currentIndex + itemsPerView >= blogPosts.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
