import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, AlertCircle, BookOpen, HeartHandshake, ArrowRight, Coffee, ExternalLink, Map, Smartphone } from "lucide-react";
import NigeriaMap from "@/components/maps/NigeriaMap";

// Import the IPCR logo and DG image
import ipcr_logo from "@assets/Institute-For-Peace-And-Conflict-Resolution.jpg";
import dg_image from "@assets/DG.png";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header with login link */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <img src={ipcr_logo} alt="IPCR Logo" className="h-16 w-16" />
            <div>
              <h1 className="text-xl font-bold text-blue-600">Institute For Peace And Conflict Resolution</h1>
              <p className="text-sm text-gray-500">Early Warning & Early Response System</p>
            </div>
          </div>
          <Link href="/auth">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCircle size={16} />
              <span>Official Login</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-12 px-4 md:py-20 bg-gradient-to-r from-blue-500 to-sky-400 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Building Peace Through Early Prevention</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Monitoring, analyzing, and responding to conflict indicators for a peaceful Nigeria
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Access Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Crisis Map Section */}
      <section className="py-10 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Nigeria Crisis Map</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              View current incidents and crisis points across Nigeria. For detailed information and response coordination, 
              please login to access the full dashboard.
            </p>
          </div>
          
          <Card className="shadow-lg border-none overflow-hidden">
            <CardContent className="p-0">
              <div className="border rounded-md overflow-hidden">
                <NigeriaMap 
                  height="500px" 
                  showIncidents={true}
                  showAddIncidentButton={false}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-red-500"></div>
              <span>High Severity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-amber-500"></div>
              <span>Medium Severity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-blue-500"></div>
              <span>Low Severity</span>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/auth">
              <Button className="flex items-center gap-2">
                <Map size={16} />
                View Full Crisis Map
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" className="flex items-center gap-2">
                <Smartphone size={16} />
                Download Mobile App
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main content sections */}
      <section className="py-16 px-4 container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* About IPCR */}
        <Card className="shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-sky-400 text-white">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              About IPCR
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <img src={ipcr_logo} alt="IPCR Logo" className="h-32" />
            </div>
            <p className="mb-4">
              The Institute for Peace and Conflict Resolution (IPCR) is a Nigerian government agency dedicated to
              strengthening Nigeria's capacity for the promotion of peace, conflict prevention, management, and resolution.
            </p>
            <p className="mb-4">
              Established in February 2000, IPCR serves as a research center, think tank, and agency for peacebuilding
              with a mandate to conduct research, engage in policy advocacy, and intervene in conflict areas.
            </p>
            <Button variant="outline" className="mt-2 w-full">
              Learn More <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* About the DG */}
        <Card className="shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-sky-400 text-white">
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-6 w-6" />
              About the Director General
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <img 
                src={dg_image} 
                alt="Director General" 
                className="h-56 rounded-md shadow-md"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dr. Joseph Ochogwu</h3>
            <p className="text-gray-500 mb-2">Director General, IPCR</p>
            <p className="mb-4">
              Dr. Joseph Ochogwu brings extensive experience in peace research, conflict resolution, and strategic
              leadership to the institute. Under his guidance, IPCR has strengthened its early warning systems and
              enhanced Nigeria's peacebuilding capacity.
            </p>
            <Button variant="outline" className="mt-2 w-full">
              Full Profile <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Report a Crisis & Peace Initiatives */}
      <section className="py-12 px-4 bg-sky-50">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Report a Crisis */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-red-500 to-amber-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6" />
                Report a Crisis
              </CardTitle>
              <CardDescription className="text-white/80">
                Help us respond quickly to emerging conflicts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">
                Our Early Warning & Early Response system relies on timely information from communities.
                If you observe signs of emerging conflict, violence, or peace threats, please report them
                through our secure channels.
              </p>
              <p className="mb-4">
                Your report will be handled confidentially and could help prevent escalation of violence
                and save lives.
              </p>
              <div className="space-y-2">
                <Link href="/auth">
                  <Button className="w-full">Login to Report</Button>
                </Link>
                <Button variant="outline" className="w-full">Call Hotline: 0800-PEACE-NG</Button>
                <Button variant="outline" className="w-full">SMS Reporting</Button>
              </div>
            </CardContent>
          </Card>

          {/* Peace Initiatives */}
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="h-6 w-6" />
                Peace Initiatives
              </CardTitle>
              <CardDescription className="text-white/80">
                Ongoing programs to foster peace and stability
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">Community Dialogue Forums</h3>
                  <p className="text-sm text-gray-600">
                    Creating spaces for inclusive dialogue among diverse communities
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">Conflict Sensitivity Training</h3>
                  <p className="text-sm text-gray-600">
                    Building capacity for peaceful conflict resolution
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">Peace Education Programs</h3>
                  <p className="text-sm text-gray-600">
                    Promoting a culture of peace through education
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">Regional Early Response Networks</h3>
                  <p className="text-sm text-gray-600">
                    Coordinated response to emerging conflicts
                  </p>
                </div>
              </div>
              
              <Button variant="outline" className="mt-6 w-full">
                View All Initiatives <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-300 mb-2">Plot 496 Abogo Largema Street</p>
              <p className="text-gray-300 mb-2">Central Business District</p>
              <p className="text-gray-300 mb-2">Abuja, Nigeria</p>
              <p className="text-gray-300">Email: info@ipcr.gov.ng</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-blue-300">Home</a></li>
                <li><a href="#" className="hover:text-blue-300">About IPCR</a></li>
                <li><a href="#" className="hover:text-blue-300">Research Publications</a></li>
                <li><a href="#" className="hover:text-blue-300">Career Opportunities</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/auth" className="hover:text-blue-300">Nigeria Crisis Map</Link></li>
                <li><a href="#" className="hover:text-blue-300">Peace Building Toolkit</a></li>
                <li><a href="#" className="hover:text-blue-300">Policy Briefs</a></li>
                <li><a href="#" className="hover:text-blue-300">Media Gallery</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
              </div>
              <p className="text-gray-300 text-sm">Subscribe to our newsletter for updates on peace initiatives and upcoming events.</p>
              <div className="mt-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Institute for Peace and Conflict Resolution. All rights reserved.</p>
            <p className="mt-1">Designed by <a href="https://afrinict.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">afrinict.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}