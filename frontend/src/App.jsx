import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Save } from 'lucide-react';
import './App.css';

export default function OAINetworkManager() {
  const [plmnConfig, setPlmnConfig] = useState({
    gNB_ID: '0xe00',
    tracking_area_code: '1',
    mcc: '001',
    mnc: '01',
    mnc_length: '2'
  });

  const [sib8Config, setSib8Config] = useState({
    messageIdentifier: '1112',
    serialNumber: '3FF1',
    dataCodingScheme: '11',
    text: 'Hello',
    lan: '6537'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = 'http://localhost:3001/api';

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const [plmnRes, sib8Res] = await Promise.all([
        fetch(`${API_URL}/plmn`),
        fetch(`${API_URL}/sib8`)
      ]);
      
      if (plmnRes.ok && sib8Res.ok) {
        const plmnData = await plmnRes.json();
        const sib8Data = await sib8Res.json();
        setPlmnConfig(plmnData);
        setSib8Config(sib8Data);
        setMessage({ type: 'success', text: 'Configurations loaded successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to load configurations' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Cannot connect to backend server' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlmnChange = (field, value) => {
    setPlmnConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSib8Change = (field, value) => {
    setSib8Config(prev => ({ ...prev, [field]: value }));
  };

  const savePlmnConfig = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/plmn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plmnConfig)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'PLMN configuration saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save PLMN configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving PLMN configuration' });
    } finally {
      setSaving(false);
    }
  };

  const saveSib8Config = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/sib8`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sib8Config)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'SIB8 configuration saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save SIB8 configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving SIB8 configuration' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader className="w-12 h-12 animate-spin" />
        <p className="loading-text">Loading configurations...</p>
      </div>
    );
  }

  return (

    <div className="page">
          <h1>OAI Network Manager</h1>
          <p className="subtitle">Configure your OpenAirInterface 5G gNB settings</p>

          {message.text && (
        <div className={`alert ${message.type}`}>
          {message.type === 'success'
            ? <CheckCircle size={20} />
            : <AlertCircle size={20} />
          }
          <span>{message.text}</span>
        </div>
          )}

          <div className="grid">

       
        <div className="card">
          <h2>PLMN Configuration</h2>

          <div className="form-group">
            <label>gNB ID</label>
            <input
              type="text"
              value={plmnConfig.gNB_ID}
              onChange={(e) => handlePlmnChange('gNB_ID', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tracking Area Code</label>
            <input
              type="text"
              value={plmnConfig.tracking_area_code}
              onChange={(e) => handlePlmnChange('tracking_area_code', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>MCC</label>
            <input
              type="text"
              value={plmnConfig.mcc}
              onChange={(e) => handlePlmnChange('mcc', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>MNC</label>
            <input
              type="text"
              value={plmnConfig.mnc}
              onChange={(e) => handlePlmnChange('mnc', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>MNC Length</label>
            <input
              type="text"
              value={plmnConfig.mnc_length}
              onChange={(e) => handlePlmnChange('mnc_length', e.target.value)}
            />
          </div>

          <button className="button" disabled={saving} onClick={savePlmnConfig}>
            {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
            &nbsp; Save PLMN Configuration
          </button>
        </div>

        <div className="card">
          <h2>SIB8 Configuration</h2>

          <div className="form-group">
            <label>Message Identifier</label>
            <input
              value={sib8Config.messageIdentifier}
              onChange={(e) => handleSib8Change('messageIdentifier', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Serial Number</label>
            <input
              value={sib8Config.serialNumber}
              onChange={(e) => handleSib8Change('serialNumber', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Data Coding Scheme</label>
            <select
              value={sib8Config.dataCodingScheme}
              onChange={(e) => handleSib8Change('dataCodingScheme', e.target.value)}
            >
              <option value="11">UCS2 (11)</option>
              <option value="10">GSM 7-bit (10)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Language</label>
            <select
              value={sib8Config.lan}
              onChange={(e) => handleSib8Change('lan', e.target.value)}
            >
              <option value="6537">English</option>
              <option value="6139">Arabic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Message Text</label>
            <textarea
              value={sib8Config.text}
              onChange={(e) => handleSib8Change('text', e.target.value)}
              rows="4"
            />
          </div>

          <button className="button" disabled={saving} onClick={saveSib8Config}>
            {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
            &nbsp; Save SIB8 Configuration
          </button>
        </div>

          </div>
    </div>
  );
}