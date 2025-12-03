import { motion } from "framer-motion";
import { Zap, Brain, Shield } from "lucide-react";
import { UploadZone } from "./UploadZone";

interface HomePageProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process entire newspapers in seconds with optimized AI extraction",
  },
  {
    icon: Brain,
    title: "Smart Extraction",
    description: "Advanced NLP automatically detects articles and extracts meaningful keywords",
  },
  {
    icon: Shield,
    title: "Secure Processing",
    description: "Your documents are processed securely and never stored permanently",
  },
];

export function HomePage({ onFileSelect, isProcessing }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-neutral-50 to-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-serif font-semibold text-foreground">
              NewsExtract
            </span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#upload" className="text-neutral-600 hover:text-primary transition-colors duration-300">
              Upload
            </a>
            <a href="#features" className="text-neutral-600 hover:text-primary transition-colors duration-300">
              Features
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
            Transform Newspapers into{" "}
            <span className="text-primary">Searchable Intelligence</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Extract, analyze, and search news articles from PDF newspapers using
            advanced AI-powered natural language processing
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          id="upload"
        >
          <UploadZone onFileSelect={onFileSelect} isProcessing={isProcessing} />
        </motion.div>

        {/* Feature Cards */}
        <motion.section
          id="features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-card rounded-xl p-8 shadow-card hover:shadow-lifted transition-all duration-300 border border-border"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mt-24 w-full px-6 py-8 text-center text-sm text-neutral-500 border-t border-border">
        <p>Powered by FastAPI, React, and AI-driven NLP</p>
      </footer>
    </div>
  );
}
