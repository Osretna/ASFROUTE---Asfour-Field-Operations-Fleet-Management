import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectBuilding } from '../../types';
import { Building2, X, Save, Sparkles, Plus } from 'lucide-react';

interface ProjectModalProps {
  mode: 'building' | 'unit';
  targetBuildingId?: string;
  targetZoneId?: string;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ mode, targetBuildingId, targetZoneId, onClose }) => {
  const { language, addProjectBuilding, addChandelierUnit, technicians } = useApp();
  const isAr = language === 'ar';

  // Building state
  const [bldNameAr, setBldNameAr] = useState('قصر الضيافة الملكي - نيو جيزة');
  const [bldNameEn, setBldNameEn] = useState('Royal Hospitality Palace - New Giza');
  const [floorsCount, setFloorsCount] = useState(3);
  const [zoneNameAr, setZoneNameAr] = useState('البهو الملكي الرئيسي');
  const [zoneNameEn, setZoneNameEn] = useState('Grand Royal Foyer');

  // Unit state
  const [unitNameAr, setUnitNameAr] = useState('ثريا اللوفر الكريستالية المركزية');
  const [unitNameEn, setUnitNameEn] = useState('Central Louvre Crystal Masterpiece');
  const [modelNumber, setModelNumber] = useState('ASF-ROYAL-900');
  const [assignedTech, setAssignedTech] = useState(technicians[0]?.nameAr || 'م. مصطفى رضوان');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'building') {
      const newProj: ProjectBuilding = {
        id: `BLD-0${Math.floor(3 + Math.random() * 10)}`,
        nameAr: bldNameAr,
        nameEn: bldNameEn,
        floorsCount: floorsCount,
        totalChandelierUnits: 1,
        installedUnits: 0,
        zones: [
          {
            id: `ZN-${Date.now()}`,
            nameAr: zoneNameAr,
            nameEn: zoneNameEn,
            floorNumber: 1,
            units: [
              {
                id: `UNT-${Date.now()}`,
                unitNameAr: 'الثريا الرئيسية للبهو',
                unitNameEn: 'Main Foyer Chandelier',
                modelNumber: 'ASF-VERSAILLES-60',
                status: 'pending',
                assignedTechAr: assignedTech,
                assignedTechEn: assignedTech
              }
            ]
          }
        ]
      };
      addProjectBuilding(newProj);
    } else {
      if (targetBuildingId && targetZoneId) {
        addChandelierUnit(targetBuildingId, targetZoneId, {
          unitNameAr,
          unitNameEn,
          modelNumber,
          assignedTechAr: assignedTech,
          assignedTechEn: assignedTech
        });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D131F] border-2 border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#DFBA6B]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'building' ? (isAr ? 'إضافة مشروع / مبنى فندقي جديد' : 'Add New Building Project') : (isAr ? 'إضافة ثريا للقاعة المحددة' : 'Add Chandelier Unit to Zone')}
              </h2>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          {mode === 'building' ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'اسم المشروع / المبنى (عربي):' : 'Building / Project Name (AR):'}</label>
                <input
                  type="text"
                  required
                  value={bldNameAr}
                  onChange={(e) => setBldNameAr(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'اسم المشروع / المبنى (إنجليزي):' : 'Building / Project Name (EN):'}</label>
                <input
                  type="text"
                  required
                  value={bldNameEn}
                  onChange={(e) => setBldNameEn(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'عدد الطوابق:' : 'Floors Count:'}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={floorsCount}
                    onChange={(e) => setFloorsCount(parseInt(e.target.value) || 1)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'اسم القاعة الافتتاحية:' : 'Initial Zone Name:'}</label>
                  <input
                    type="text"
                    required
                    value={zoneNameAr}
                    onChange={(e) => setZoneNameAr(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            // Unit form
            <>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'اسم وموقع الثريا (عربي):' : 'Unit Title (AR):'}</label>
                <input
                  type="text"
                  required
                  value={unitNameAr}
                  onChange={(e) => setUnitNameAr(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'كود الموديل:' : 'Model Code:'}</label>
                  <input
                    type="text"
                    required
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400">{isAr ? 'الفني المسؤول:' : 'Assigned Tech:'}</label>
                  <select
                    value={assignedTech}
                    onChange={(e) => setAssignedTech(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={isAr ? t.nameAr : t.nameEn}>{isAr ? t.nameAr : t.nameEn}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] flex items-center gap-1.5 shadow-lg shadow-[#C5A45B]/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ وإضافة' : 'Save & Add'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
