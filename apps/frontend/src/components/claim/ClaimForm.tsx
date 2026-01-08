'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import QRCodeScanner from '@/components/claim/QRCodeScanner';

export default function ClaimForm() {
  const handleScanComplete = () => {
    // QR code scanned
  };
  
  return (
    <Card>
      <CardContent className="pt-6 pb-6">
        <QRCodeScanner onScan={handleScanComplete} />
      </CardContent>
    </Card>
  );
}
