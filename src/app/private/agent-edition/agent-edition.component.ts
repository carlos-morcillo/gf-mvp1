import { NgClass } from '@angular/common';
import { Component, output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-agent-edition',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './agent-edition.component.html',
  styleUrl: './agent-edition.component.scss',
})
export class AgentEditionComponent {
  navigate = output<'agents'>();

  // FormGroup principal
  agentForm: FormGroup;

  // Estados del drag & drop
  dragState: 'idle' | 'dragover' | 'dropping' = 'idle';

  // Configuración de archivos permitidos
  private readonly allowedTypes = ['pdf', 'doc', 'docx', 'txt'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  // Mensajes de error para archivos
  fileErrorMessage = '';

  // Opciones de tipos de agente
  agentTypes = [
    { value: 'Conversacional', label: 'Conversacional', icon: '💬' },
    { value: 'Analítico', label: 'Analítico', icon: '📊' },
    { value: 'Productividad', label: 'Productividad', icon: '⚡' },
    { value: 'Creativo', label: 'Creativo', icon: '💡' },
  ];

  constructor(private fb: FormBuilder) {
    this.agentForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      type: ['Conversacional', [Validators.required]],
      files: this.fb.array([]), // Sin archivos de ejemplo
    });
  }

  // Getters para acceso fácil a los controles
  get name() {
    return this.agentForm.get('name');
  }
  get description() {
    return this.agentForm.get('description');
  }
  get type() {
    return this.agentForm.get('type');
  }
  get files() {
    return this.agentForm.get('files') as FormArray;
  }

  // Getter para obtener la lista de archivos como array
  get uploadedFiles(): string[] {
    return this.files.value;
  }

  onGoBack() {
    this.navigate.emit('agents');
  }

  onSelectType(type: string) {
    this.type?.setValue(type);
  }

  // Métodos para manejo de archivos en FormArray
  private addFile(fileName: string): void {
    this.files.push(this.fb.control(fileName));
  }

  private removeFileAt(index: number): void {
    this.files.removeAt(index);
  }

  // Validación robusta de archivos
  private validateFile(file: File): { valid: boolean; error?: string } {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !this.allowedTypes.includes(extension)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Solo se permiten: ${this.allowedTypes.join(
          ', '
        )}`,
      };
    }

    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Máximo 10MB.',
      };
    }

    if (this.uploadedFiles.includes(file.name)) {
      return { valid: false, error: 'Este archivo ya ha sido agregado.' };
    }

    return { valid: true };
  }

  // Procesamiento unificado de archivos
  private processFiles(files: FileList | File[]): void {
    this.fileErrorMessage = '';
    const filesToAdd: string[] = [];
    const errors: string[] = [];

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const validation = this.validateFile(file);

      if (validation.valid) {
        filesToAdd.push(file.name);
      } else {
        errors.push(validation.error!);
      }
    }

    // Actualizar FormArray con nuevos archivos
    filesToAdd.forEach((fileName) => this.addFile(fileName));

    // Mostrar errores si los hay
    if (errors.length > 0) {
      this.fileErrorMessage = errors[0]; // Mostrar solo el primer error
      setTimeout(() => (this.fileErrorMessage = ''), 5000); // Limpiar después de 5s
    }
  }

  // Event handlers mejorados
  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(input.files);
      input.value = ''; // Limpiar input
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragState = 'dragover';
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragState = 'dragover';
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Solo cambiar estado si realmente salimos del área
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.dragState = 'idle';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.dragState = 'dropping';

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(files);
    }

    setTimeout(() => (this.dragState = 'idle'), 300); // Feedback visual
  }

  onRemoveFile(fileName: string): void {
    const index = this.uploadedFiles.findIndex((file) => file === fileName);
    if (index > -1) {
      this.removeFileAt(index);
    }
  }

  onCreateAgent(): void {
    // Marcar todos los campos como touched para mostrar errores
    this.agentForm.markAllAsTouched();

    if (this.agentForm.valid) {
      console.log('Crear agente con:', this.agentForm.value);
      // Aquí iría la lógica para enviar el formulario
    } else {
      console.log('Formulario inválido:', this.agentForm.errors);
    }
  }

  // Métodos auxiliares para validaciones en el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.agentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.agentForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength'])
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength'])
        return `${fieldName} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  // Getters para el template
  get isDragOver(): boolean {
    return this.dragState === 'dragover';
  }

  get isDropping(): boolean {
    return this.dragState === 'dropping';
  }
}
