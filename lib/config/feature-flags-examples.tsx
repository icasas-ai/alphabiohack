// Ejemplo de uso del sistema de Feature Flags
// Este archivo muestra cómo usar los feature flags en diferentes escenarios

import { PST_TZ, dateKeyInTZ } from '@/lib/utils/timezone';
import { useAppointmentTypes, useBookingSettings, useFeatureFlags } from '@/hooks';

import { BookingType } from '@/lib/prisma-browser';

// Ejemplo 1: Componente que muestra solo tipos de citas habilitados
export function AppointmentTypeDisplay() {
  const { enabled, count, hasMultiple } = useAppointmentTypes();
  
  return (
    <div>
      <h3>Tipos de citas disponibles ({count})</h3>
      {hasMultiple ? (
        <ul>
          {enabled.map(type => (
            <li key={type}>{type}</li>
          ))}
        </ul>
      ) : (
        <p>Solo hay un tipo de cita disponible: {enabled[0]}</p>
      )}
    </div>
  );
}

// Ejemplo 2: Componente condicional basado en feature flags
export function ConditionalBookingOptions() {
  const { 
    canBookOnline, 
    canBookByPhone, 
    canBookHomeVisits, 
    canBookVideoCalls,
    canBookClinicVisits 
  } = useFeatureFlags();
  
  return (
    <div className="space-y-4">
      {canBookClinicVisits() && (
        <div className="p-4 border rounded">
          <h4>🏥 Citas Presenciales</h4>
          <p>Visita nuestra clínica para una consulta presencial</p>
        </div>
      )}
      
      {canBookOnline() && (
        <div className="p-4 border rounded">
          <h4>💻 Citas en Línea</h4>
          <p>Consulta desde la comodidad de tu hogar</p>
        </div>
      )}
      
      {canBookVideoCalls() && (
        <div className="p-4 border rounded">
          <h4>📹 Video Llamadas</h4>
          <p>Consulta por video llamada de alta calidad</p>
        </div>
      )}
      
      {canBookByPhone() && (
        <div className="p-4 border rounded">
          <h4>📞 Citas por Teléfono</h4>
          <p>Consulta telefónica conveniente</p>
        </div>
      )}
      
      {canBookHomeVisits() && (
        <div className="p-4 border rounded">
          <h4>🏠 Visitas a Domicilio</h4>
          <p>El doctor viene a tu hogar</p>
        </div>
      )}
    </div>
  );
}

// Ejemplo 3: Componente con configuraciones de tiempo
export function BookingDatePicker() {
  const { 
    getMaxBookingDate, 
    getMinBookingDate, 
    canBookToday,
    canBookTomorrow 
  } = useBookingSettings();
  
  const maxDate = getMaxBookingDate();
  const minDate = getMinBookingDate();
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="booking-date">Selecciona una fecha:</label>
        <input
          id="booking-date"
          type="date"
          min={dateKeyInTZ(minDate, PST_TZ)}
          max={dateKeyInTZ(maxDate, PST_TZ)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="text-sm text-gray-600">
        <p>📅 Puedes reservar desde: {minDate.toLocaleDateString()}</p>
        <p>📅 Hasta: {maxDate.toLocaleDateString()}</p>
        {canBookToday() && <p>✅ Citas disponibles para hoy</p>}
        {canBookTomorrow() && <p>✅ Citas disponibles para mañana</p>}
      </div>
    </div>
  );
}

// Ejemplo 4: Verificación específica de tipos
export function SpecificTypeCheck() {
  const { isEnabled } = useAppointmentTypes();
  
  const checkSpecificTypes = () => {
    const checks = {
      'DirectVisit': isEnabled(BookingType.DirectVisit),
      'VideoCall': isEnabled(BookingType.VideoCall),
      'PhoneCall': isEnabled(BookingType.PhoneCall),
      'HomeVisit': isEnabled(BookingType.HomeVisit),
    };
    
    return checks;
  };
  
  const typeChecks = checkSpecificTypes();
  
  return (
    <div>
      <h3>Verificación de tipos específicos:</h3>
      <ul>
        {Object.entries(typeChecks).map(([type, enabled]) => (
          <li key={type}>
            {type}: {enabled ? '✅ Habilitado' : '❌ Deshabilitado'}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Ejemplo 5: Configuración completa de feature flags
export function FeatureFlagsDebug() {
  const { flags } = useFeatureFlags();
  
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>🔧 Configuración de Feature Flags</h3>
      <pre className="text-sm overflow-auto">
        {JSON.stringify(flags, null, 2)}
      </pre>
    </div>
  );
}

// Ejemplo 6: Componente que se adapta según la configuración
export function AdaptiveBookingForm() {
  const { enabled } = useAppointmentTypes();
  const { allowSameDay, requirePhoneVerification } = useFeatureFlags();
  
  return (
    <form className="space-y-4">
      <div>
        <label>Tipo de cita:</label>
        <select className="w-full p-2 border rounded">
          {enabled.map(type => (
            <option key={type} value={type}>
              {type === 'DirectVisit' && '🏥 Presencial'}
              {type === 'VideoCall' && '📹 Video Llamada'}
              {type === 'PhoneCall' && '📞 Llamada Telefónica'}
              {type === 'HomeVisit' && '🏠 Visita a Domicilio'}
            </option>
          ))}
        </select>
      </div>
      
      {allowSameDay && (
        <div className="p-2 bg-green-100 rounded">
          ✅ Citas disponibles para hoy
        </div>
      )}
      
      {requirePhoneVerification && (
        <div className="p-2 bg-yellow-100 rounded">
          ⚠️ Se requiere verificación telefónica
        </div>
      )}
    </form>
  );
}
