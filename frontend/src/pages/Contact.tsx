import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Header } from "@/components/Header";
import { api } from "@/services/api";
import { Mail, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email && !formData.phone) {
      toast.error("Validation Failed", {
        description: "Please provide either an email or a phone number.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.sendMessage(formData);
      toast.success("Message Sent!", { description: response.message });
      setFormData({ name: "", email: "", phone: "", message: "" }); // Clear form
    } catch (error: any) {
      toast.error("Submission Failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-950 flex items-center justify-center p-4 pt-32">
      <Header />
      <div
        className={`
          w-full max-w-2xl relative z-10
          transform transition-all duration-1000 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
      >
        <Card className="relative bg-white/90 dark:bg-slate-800/80 backdrop-blur-lg shadow-2xl border-amber-200 dark:border-gray-800">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-white/80 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-lg group dark:border-slate-700 dark:bg-slate-800/70"
          >
            <ArrowLeft className="h-5 w-5 text-amber-600 transition-transform duration-300 group-hover:-translate-x-1 dark:text-amber-400" />
          </button>
          <CardHeader className="text-center pt-12">
            <Mail className="mx-auto h-12 w-12 text-amber-500" />
            <CardTitle className="text-3xl font-bold mt-4">
              Contact Us
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Have a question or feedback? Fill out the form below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                OR
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  rows={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg transform transition-all duration-300 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
