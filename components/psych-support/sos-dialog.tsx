"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, AlertTriangle, Heart } from "lucide-react"

interface SosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SosDialog({ open, onOpenChange }: SosDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-red-200 bg-red-50">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-2xl text-red-900">Emergency Protocol Activated</DialogTitle>
          <DialogDescription className="text-red-700">
            If you are in immediate danger or crisis, please reach out for help immediately.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Crisis Hotline */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-red-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-900">Crisis Hotline</p>
              <p className="text-2xl font-bold text-red-600">116 123</p>
            </div>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.open("tel:116123")}
            >
              Call Now
            </Button>
          </div>

          {/* Additional Resources */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-800">Additional Emergency Contacts:</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Emergency Services: <strong>112</strong></li>
              <li>• University Counseling: Contact your institution</li>
              <li>• Text Support: Text HOME to 741741</li>
            </ul>
          </div>

          {/* Reassurance */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-red-200">
            <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              You are not alone. Help is available 24/7. Your feelings are valid, and reaching out for support is a sign of strength.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-red-200 text-red-700 hover:bg-red-100"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
