# Vitafit Body Composition

Web app that reads weight and body composition from a **Vitafit VT7018 scale** ("Vitafit Body Fat") over Web Bluetooth, without the official Vitafit app, and uploads the results to:

- **Garmin Connect**, through a proxy API.
- **Intervals.icu**, as wellness data.
- **Apple Health**, through an iOS Shortcut.

Forked from [lswiderski/WebBodyComposition](https://github.com/lswiderski/WebBodyComposition) and adapted to the Vitafit scale.

There is no public instance: deploy your own (see [Deployment](#deployment)).

## How it works

1. Open the app and go to **Vitafit Scale Scanner**. Enter your height, age, sex and athlete mode, the same values as in your Vitafit app profile.
2. Step on the scale barefoot, tap **Connect to scale** and pick "Vitafit Body Fat". The app reads the weight and the impedance. On later weighings, if the browser remembers the scale (`navigator.bluetooth.getDevices()`), the app reconnects to it without the device list; if the scale does not answer within 8 s, the list opens as usual.
3. The app computes the body composition with regression formulas equivalent to those of the Vitafit app, validated against real measurements. Profiles: male, female, and the athlete variant of each.
4. Review the values in the sync form, choose where to send them and submit.

The official Vitafit app must not have Bluetooth access while you use this app: the scale accepts a single connection and the Vitafit app would take it first.

### Browsers

Web Bluetooth needs HTTPS and a compatible browser:

- **iPhone / iPad:** [Bluefy - Web BLE Browser](https://apps.apple.com/us/app/bluefy-web-ble-browser/id1492822055). Safari and Chrome for iOS do not support Web Bluetooth.
- **Android, desktop:** Chrome or Edge.

### Metrics

| Metric | Garmin Connect | Intervals.icu | Apple Health |
|---|---|---|---|
| Weight (kg) | `weight` | `weight` | Weight |
| BMI | `bodyMassIndex` | `BMI` (custom) | Body Mass Index |
| Body fat (%) | `percentFat` | `bodyFat` | Body Fat Percentage |
| Lean body mass (kg) | — | — | Lean Body Mass |
| Skeletal muscle mass (kg) | `muscleMass` | `MuscleMass` (custom) | — |
| Body water (%) | `percentHydration` | `Water` (custom) | — |
| Bone mass (kg) | `boneMass` | `BoneMass` (custom) | — |
| Visceral fat | `visceralFatRating` | `VisceralFat` (custom) | — |
| Metabolic age | `metabolicAge` | — | — |

The scanner also shows muscle (%), protein (%) and basal metabolic rate, which are not uploaded.

## Sync targets

### Garmin Connect

Garmin has no public API for body composition, so the app sends your data and your Garmin credentials to a proxy API, which uploads them to Garmin Connect. The proxy does not store anything. Accounts with two-factor authentication are supported: the form asks for the MFA code when Garmin requires it.

Proxy: [YAGCC - Yet Another Garmin Connect Client](https://github.com/lswiderski/yet-another-garmin-connect-client). It runs as a Docker container, so you can deploy your own instance (for example on Render).

The proxy URLs are set with environment variables (see [Configuration](#configuration)):

- `NEXT_PUBLIC_YAGCC_URL`: YAGCC, used by the sync form (`/sync/bodycomposition`).
- `NEXT_PUBLIC_BODYCOMPOSITION_WEBAPI_URL`: the older [bodycomposition-webapi](https://github.com/lswiderski/bodycomposition-webapi) proxy, used by `/sync/garmin` and by the ".fit file only" download link.

### Intervals.icu

The app writes a wellness entry for the current day with your Intervals.icu API key (Settings → Developer Settings). `weight` and `bodyFat` are standard Intervals.icu fields. The other five values go to **custom wellness fields that you have to create once**. If a field does not exist, Intervals.icu ignores that value without any error.

#### Creating the custom wellness fields

| Name (free text) | Code (exact, case-sensitive) | Input type | Unit / meaning |
|---|---|---|---|
| BMI | `BMI` | Numeric | kg/m² |
| Muscle Mass | `MuscleMass` | Numeric | kg (skeletal muscle mass) |
| Water | `Water` | Numeric | % of body weight |
| Bone Mass | `BoneMass` | Numeric | kg |
| Visceral Fat | `VisceralFat` | Numeric | rating (1-60) |

For each field:

1. In Intervals.icu, open the wellness dialog: on the calendar, click a day (or **+**) and choose **Wellness**.
2. In the wellness dialog, click **Fields**. This lists the standard wellness options and your custom fields.
3. Click the **+** (plus) icon to create a new field.
4. Fill in the form:
   - **Name:** anything you like (it is only a label).
   - **Code:** exactly as in the table above. The code is what the app sends through the API: a different spelling or case (`Bmi`, `muscleMass`, `Muscle_Mass`) is a different field and the value is lost. Codes must be CamelCase and cannot start with a digit; codes starting with a lowercase letter are reserved for built-in fields.
   - **Input type:** Numeric.
   - **Description** (optional): the unit, for example "kg, skeletal muscle".
   - Leave it private unless you want to share it with other users.
5. Save the field, make sure it is ticked in the **Fields** list and confirm the dialogs with **OK**. A ticked field appears in the wellness dialog.
6. Optional: to see the values on the calendar, use **Options → Wellness** on the calendar page and select the fields. Custom wellness fields can also be plotted on the Fitness and Compare pages.

If someone has already shared a field with the same code (the search button in **Fields** finds shared fields), you can add that one instead: two fields with the same code are the same field. Do not change a code once the field has data.

To check that everything works, submit a weighing from this app and open that day's wellness dialog in Intervals.icu: the five values should appear next to the weight and body fat.

> These steps follow the Intervals.icu forum announcement of custom wellness fields (November 2022). The interface may have changed since; the important part is the **code**.

If Intervals.icu also imports weight and body fat from Garmin Connect, both sources write the same fields for the same day.

### Apple Health

A web app cannot write to Apple Health, so the app hands the values to an iOS Shortcut named **Vitafit to Health**, which logs them. Apple Health has fields for weight, BMI, body fat percentage and lean body mass (weight × (1 − body fat %)); it has none for the other metrics.

When **Apple Health** is checked, the app first uploads to the other selected services and then opens:

```
shortcuts://run-shortcut?name=Vitafit%20to%20Health&input=text&text={"weight":68.95,"bmi":22.26,"bodyFat":12.54,"leanBodyMass":60.3}
```

(with the JSON URL-encoded). Create the shortcut once on the iPhone:

1. Open **Shortcuts**, tap **+** and name the shortcut exactly `Vitafit to Health`.
2. Add **Get Dictionary from Input** and set its input to **Shortcut Input**.
3. Add **Get Dictionary Value**: Get *Value* for key `weight` in *Dictionary*.
4. Add **Log Health Sample**: type **Weight**, value *Dictionary Value*, unit **kg**.
5. Repeat steps 3 and 4 for:
   - key `bmi` → type **Body Mass Index**;
   - key `bodyFat` → type **Body Fat Percentage** (the value is a percentage, e.g. 12.54);
   - key `leanBodyMass` → type **Lean Body Mass**, unit **kg**.
   In each step pick the *Dictionary* returned by step 2 and the *Dictionary Value* of the step just above.
6. Run the sync once and allow the shortcut to write to Health when iOS asks.

If Garmin Connect is also connected to Apple Health, weight and body fat may be logged twice for the same weighing: uncheck one of the two.

## Configuration

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_YAGCC_URL` | Garmin Connect upload from the sync form (YAGCC proxy base URL) |
| `NEXT_PUBLIC_BODYCOMPOSITION_WEBAPI_URL` | Garmin upload from `/sync/garmin` and ".fit file only" downloads (bodycomposition-webapi base URL) |

Use base URLs, without the trailing `/upload`. Next.js embeds `NEXT_PUBLIC_*` variables in the browser code **at build time**: set them before building, and rebuild after changing them. If a variable is missing, the corresponding action shows "… is not configured". Intervals.icu needs no configuration.

For local development, copy `.env.example` to `.env.local` and fill it in.

## Deployment

The app is a Next.js project with no server-side code of its own. Garmin sync needs a proxy (YAGCC).

### Render (recommended)

Render can host both the web app and the YAGCC Docker container, so everything lives on one platform.

1. **Garmin proxy:** new *Web Service* from the YAGCC repository, runtime *Docker*. Note its URL.
2. **Web app:** new *Web Service* from this repository, build command `npm ci && npm run build`, start command `npm start`. Under *Environment*, set `NEXT_PUBLIC_YAGCC_URL` to the proxy URL from step 1 (and `NEXT_PUBLIC_BODYCOMPOSITION_WEBAPI_URL` if you use `/sync/garmin`).

### Vercel

Import the repository in Vercel; it detects Next.js automatically. Set the environment variables in *Project Settings → Environment Variables* and redeploy. Vercel does not run Docker containers, so the Garmin proxy has to be hosted elsewhere (for example on Render).

## Development

```
npm ci
cp .env.example .env.local   # then edit the proxy URLs
npm run dev    # http://localhost:3000
npm test       # body composition formulas and scale protocol (replay of a real weighing)
```

Web Bluetooth works on `localhost` without HTTPS in Chrome.

## Disclaimer

Open source community project, not affiliated with Vitafit or Garmin. Use it at your own risk.
