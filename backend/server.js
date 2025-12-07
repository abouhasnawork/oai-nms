const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const PLMN_CONFIG_PATH = process.env.PLMN_CONFIG_PATH || path.join(
  process.env.HOME,
  '/config/gnb.conf'
);

const SIB8_CONFIG_PATH = process.env.SIB8_CONFIG_PATH || path.join(
  process.env.HOME,
  '/config/sib8.conf'
);

function parsePlmnConfig(content) {
  const config = {
    gNB_ID: '',
    tracking_area_code: '',
    mcc: '',
    mnc: '',
    mnc_length: ''
  };

  const gNB_ID_match = content.match(/gNB_ID\s*=\s*([^;]+);/);
  if (gNB_ID_match) config.gNB_ID = gNB_ID_match[1].trim();

  const tac_match = content.match(/tracking_area_code\s*=\s*([^;]+);/);
  if (tac_match) config.tracking_area_code = tac_match[1].trim();

  const mcc_match = content.match(/mcc\s*=\s*(\d+)/);
  if (mcc_match) config.mcc = mcc_match[1];

  const mnc_match = content.match(/mnc\s*=\s*(\d+)/);
  if (mnc_match) config.mnc = mnc_match[1];

  const mnc_length_match = content.match(/mnc_length\s*=\s*(\d+)/);
  if (mnc_length_match) config.mnc_length = mnc_length_match[1];

  return config;
}

function parseSib8Config(content) {
  const config = {
    messageIdentifier: '',
    serialNumber: '',
    dataCodingScheme: '',
    text: '',
    lan: ''
  };

  const lines = content.split('\n');

  lines.forEach(line => {
    const index = line.indexOf('=');
    if (index === -1) return;

    const key = line.substring(0, index).trim();
    const value = line.substring(index + 1).replace(';','').trim();

    if (config.hasOwnProperty(key)) {
      if (key === "text") {
        config[key] = value.replace(/\|/g, "\n");
      } else {
        config[key] = value;
      }
    }
  });

  return config;
}


function writePlmnConfig(originalContent, newConfig) {
  let content = originalContent;

  content = content.replace(
    /gNB_ID\s*=\s*[^;]+;/,
    `gNB_ID    =  ${newConfig.gNB_ID};`
  );

  content = content.replace(
    /tracking_area_code\s*=\s*[^;]+;/,
    `tracking_area_code  =  ${newConfig.tracking_area_code};`
  );

  content = content.replace(
    /mcc\s*=\s*\d+/,
    `mcc = ${newConfig.mcc}`
  );

  content = content.replace(
    /mnc\s*=\s*\d+/,
    `mnc = ${newConfig.mnc}`
  );

  content = content.replace(
    /mnc_length\s*=\s*\d+/,
    `mnc_length = ${newConfig.mnc_length}`
  );

  return content;
}

function writeSib8Config(config) {
  const safeText = config.text.replace(/\n/g, "|");

  return `messageIdentifier=${config.messageIdentifier};
serialNumber=${config.serialNumber};
dataCodingScheme=${config.dataCodingScheme};
text=${safeText};
lan=${config.lan};
`;
}


app.get('/api/plmn', async (req, res) => {
  try {
    const content = await fs.readFile(PLMN_CONFIG_PATH, 'utf8');
    const config = parsePlmnConfig(content);
    res.json(config);
  } catch (error) {
    console.error('Error reading PLMN config:', error);
    res.status(500).json({ error: 'Failed to read PLMN configuration' });
  }
});

app.post('/api/plmn', async (req, res) => {
  try {
    const originalContent = await fs.readFile(PLMN_CONFIG_PATH, 'utf8');
    const newContent = writePlmnConfig(originalContent, req.body);
    await fs.writeFile(PLMN_CONFIG_PATH, newContent, 'utf8');
    res.json({ success: true, message: 'PLMN configuration saved' });
  } catch (error) {
    console.error('Error writing PLMN config:', error);
    res.status(500).json({ error: 'Failed to save PLMN configuration' });
  }
});

app.get('/api/sib8', async (req, res) => {
  try {
    const content = await fs.readFile(SIB8_CONFIG_PATH, 'utf8');
    const config = parseSib8Config(content);
    res.json(config);
  } catch (error) {
    console.error('Error reading SIB8 config:', error);
    res.status(500).json({ error: 'Failed to read SIB8 configuration' });
  }
});

app.post('/api/sib8', async (req, res) => {
  try {
    const newContent = writeSib8Config(req.body);
    await fs.writeFile(SIB8_CONFIG_PATH, newContent, 'utf8');
    res.json({ success: true, message: 'SIB8 configuration saved' });
  } catch (error) {
    console.error('Error writing SIB8 config:', error);
    res.status(500).json({ error: 'Failed to save SIB8 configuration' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 PLMN config: ${PLMN_CONFIG_PATH}`);
  console.log(`📁 SIB8 config: ${SIB8_CONFIG_PATH}`);
});